// Edge Function: envia um e-mail para a Wirlla a cada novo cadastro no Avise-me.
// Disparada por um Database Webhook da tabela `leads` (evento INSERT).
// Só cadastros novos disparam: se a pessoa se cadastrar de novo, o webhook não é chamado.
//
// Variáveis de ambiente (Supabase > Edge Functions > Secrets):
//   RESEND_API_KEY     chave da API do Resend (https://resend.com)
//   EMAIL_REMETENTE    ex.: "Atalia Brechó <avisos@seudominio.com.br>" (domínio verificado no Resend)
//   EMAIL_DESTINO      e-mail que recebe o aviso, ex.: ataliabrecho@gmail.com
//   WEBHOOK_SECRET     texto aleatório; o mesmo valor vai no cabeçalho do webhook

const escapar = (valor: unknown) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// "5581999998888" -> "(81) 99999-8888"
function formatarWhatsapp(numero: string) {
  const d = numero.replace(/^55/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return numero
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Método não permitido', { status: 405 })

  const segredo = Deno.env.get('WEBHOOK_SECRET')
  if (!segredo || req.headers.get('x-webhook-secret') !== segredo) {
    return new Response('Não autorizado', { status: 401 })
  }

  let corpo: any
  try {
    corpo = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  // O webhook envia { type, table, record, old_record }
  if (corpo.type !== 'INSERT' || corpo.table !== 'leads' || !corpo.record) {
    return new Response('Ignorado', { status: 200 })
  }

  const lead = corpo.record
  const whatsapp = formatarWhatsapp(String(lead.whatsapp ?? ''))
  const tamanhos = (lead.tamanhos ?? []).join(', ') || '—'
  const categorias = (lead.categorias ?? []).join(', ') || 'Todas'
  const linkWhats = `https://wa.me/${lead.whatsapp}`

  const assunto = `Novo aviso: ${lead.nome} quer saber das peças (${tamanhos})`

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5">
      <h2 style="margin:0 0 12px">Nova pessoa no Avise-me</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Nome</strong></td><td>${escapar(lead.nome)}</td></tr>
        <tr><td><strong>WhatsApp</strong></td><td>${escapar(whatsapp)}</td></tr>
        <tr><td><strong>Tamanhos</strong></td><td>${escapar(tamanhos)}</td></tr>
        <tr><td><strong>Tipos de peça</strong></td><td>${escapar(categorias)}</td></tr>
        <tr><td><strong>Onde se cadastrou</strong></td><td>${escapar(lead.origem)}</td></tr>
      </table>
      <p style="margin:20px 0">
        <a href="${linkWhats}" style="background:#5b6b3a;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;display:inline-block">
          Chamar no WhatsApp
        </a>
      </p>
      <p style="color:#666;font-size:13px">
        Para ver a lista completa e avisar quem pediu cada tamanho, acesse o painel em /admin, aba Avise-me.
      </p>
    </div>`

  const texto = [
    'Nova pessoa no Avise-me',
    `Nome: ${lead.nome}`,
    `WhatsApp: ${whatsapp}`,
    `Tamanhos: ${tamanhos}`,
    `Tipos de peça: ${categorias}`,
    `Onde se cadastrou: ${lead.origem}`,
    `Chamar no WhatsApp: ${linkWhats}`,
    'Lista completa: painel /admin, aba Avise-me.',
  ].join('\n')

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_REMETENTE'),
      to: [Deno.env.get('EMAIL_DESTINO')],
      subject: assunto,
      html,
      text: texto,
    }),
  })

  if (!resposta.ok) {
    // Não derruba o cadastro: a pessoa já foi salva no banco. Só registra o erro.
    console.error('Falha ao enviar e-mail do Avise-me:', resposta.status, await resposta.text())
    return new Response('Falha no envio', { status: 502 })
  }

  return new Response('Enviado', { status: 200 })
})
