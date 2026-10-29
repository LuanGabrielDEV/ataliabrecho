#!/usr/bin/env python3
"""
Tira o fundo de uma pasta inteira de fotos de roupas, de graça e sem limite, no seu computador.

Entra uma pasta com as fotos (A127.jpg, A128.jpg, ...) e sai outra pasta com os recortes
(A127_recorte.png, A128_recorte.png, ...), prontos para a aba "Importar" do painel:
é só colocar as fotos originais e os recortes juntos na hora de escolher os arquivos.

Instalação (uma vez, precisa de Python 3.11 a 3.13):
    pip install "rembg[cpu,cli]" pillow

Uso:
    python scripts/recortar-fotos.py fotos/ recortes/
    python scripts/recortar-fotos.py fotos/ recortes/ --todas           # recorta também A127_2, A127_3...
    python scripts/recortar-fotos.py fotos/ recortes/ --modelo birefnet-general   # mais preciso, mais lento

Na primeira execução o modelo é baixado (100 a 200 MB) e fica guardado no computador.

Sobre licença: o rembg é MIT, mas cada modelo tem a própria licença. Por isso este script só aceita
modelos cujo código é de licença livre (Apache-2.0 ou MIT). O modelo "bria-rmbg" (padrão do rembg)
é proibido para uso comercial e fica bloqueado aqui. Antes de adotar outro modelo, confira a licença.
"""

import argparse
import io
import re
import sys
from pathlib import Path

EXTENSOES = {".jpg", ".jpeg", ".png", ".webp"}

# código de cada modelo: isnet-general-use = DIS (Apache-2.0); birefnet = MIT; u2net = Apache-2.0
MODELOS_PERMITIDOS = {"isnet-general-use", "birefnet-general", "birefnet-general-lite", "u2net"}

# "A127_2" é a segunda foto da peça A127; "A127" é a principal
FOTO_EXTRA = re.compile(r"^(?P<id>.+?)[_-](?P<n>\d{1,2})$")


def ja_e_recorte(nome: str) -> bool:
    return bool(re.search(r"[\s_-](recorte|ia)$", nome, re.IGNORECASE))


def recortar_imagem(dados: bytes, sessao, lado_max: int, margem: float):
    """Devolve uma imagem RGBA sem fundo, cortada rente ao objeto, com uma margem em volta."""
    from PIL import Image, ImageOps
    from rembg import remove  # importado aqui para os testes poderem trocar o módulo

    original = ImageOps.exif_transpose(Image.open(io.BytesIO(dados))).convert("RGB")
    original.thumbnail((lado_max, lado_max))  # reduz antes: bem mais rápido e o site usa até 1400 px

    resultado = remove(original, session=sessao, post_process_mask=True)
    if resultado.mode != "RGBA":
        resultado = resultado.convert("RGBA")

    caixa = resultado.getchannel("A").getbbox()  # onde existe objeto
    if caixa is None:
        return None  # o modelo não achou nada
    resultado = resultado.crop(caixa)

    # margem proporcional, para a peça não colar na borda do cartão do site
    pad = int(max(resultado.size) * margem)
    tela = Image.new("RGBA", (resultado.width + 2 * pad, resultado.height + 2 * pad), (0, 0, 0, 0))
    tela.paste(resultado, (pad, pad))
    return tela


def principal(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Tira o fundo das fotos de uma pasta (lote).")
    ap.add_argument("entrada", type=Path, help="pasta com as fotos originais")
    ap.add_argument("saida", type=Path, help="pasta onde os recortes serão gravados")
    ap.add_argument("--modelo", default="isnet-general-use", choices=sorted(MODELOS_PERMITIDOS))
    ap.add_argument("--todas", action="store_true", help="recorta também as fotos extras (A127_2, A127_3...)")
    ap.add_argument("--refazer", action="store_true", help="refaz recortes que já existem na pasta de saída")
    ap.add_argument("--tamanho", type=int, default=1400, help="maior lado da imagem, em pixels (padrão 1400)")
    ap.add_argument("--margem", type=float, default=0.06, help="respiro em volta da peça, de 0 a 0.3 (padrão 0.06)")
    args = ap.parse_args(argv)

    if not args.entrada.is_dir():
        print(f"Pasta de entrada não encontrada: {args.entrada}", file=sys.stderr)
        return 2
    if not 0 <= args.margem <= 0.3:
        print("A margem precisa estar entre 0 e 0.3.", file=sys.stderr)
        return 2

    fotos = sorted(p for p in args.entrada.iterdir() if p.suffix.lower() in EXTENSOES and not ja_e_recorte(p.stem))
    if not args.todas:
        fotos = [p for p in fotos if not FOTO_EXTRA.match(p.stem)]
    if not fotos:
        print("Nenhuma foto encontrada para recortar (JPG, PNG ou WebP).")
        return 0

    try:
        from rembg import new_session
    except ImportError:
        print('Falta instalar: pip install "rembg[cpu,cli]" pillow', file=sys.stderr)
        return 3

    args.saida.mkdir(parents=True, exist_ok=True)
    print(f"{len(fotos)} foto(s), modelo {args.modelo}. A primeira execução baixa o modelo; seja paciente.")
    sessao = new_session(args.modelo)

    feitas, puladas, falhas = 0, 0, []
    for i, caminho in enumerate(fotos, 1):
        destino = args.saida / f"{caminho.stem}_recorte.png"
        if destino.exists() and not args.refazer:
            puladas += 1
            print(f"[{i}/{len(fotos)}] {caminho.name}: já tem recorte, pulei")
            continue
        try:
            imagem = recortar_imagem(caminho.read_bytes(), sessao, args.tamanho, args.margem)
            if imagem is None:
                raise ValueError("o modelo não encontrou a peça na foto")
            imagem.save(destino, "PNG", optimize=True)
            feitas += 1
            print(f"[{i}/{len(fotos)}] {caminho.name} -> {destino.name}")
        except Exception as erro:  # uma foto ruim não pode parar o lote
            falhas.append((caminho.name, str(erro)))
            print(f"[{i}/{len(fotos)}] {caminho.name}: FALHOU ({erro})")

    print(f"\nPronto: {feitas} recortada(s), {puladas} já existiam, {len(falhas)} falha(s).")
    for nome, motivo in falhas:
        print(f"  - {nome}: {motivo}")
    print("Confira os recortes antes de importar: renda, tule e alças finas costumam sair imperfeitos.")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(principal())
