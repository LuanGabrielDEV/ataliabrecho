// Textos e fotos de "Nossa história", enviados pela Wirlla (25/10/2026).
// Tudo o que aparece na seção da página inicial e em /nossa-historia sai daqui.
import fotoRetrato from '../assets/historia/wirlla-retrato.webp'
import fotoSorriso from '../assets/historia/wirlla-sorriso.webp'
import fotoTrabalho from '../assets/historia/wirlla-trabalho.webp'
import fotoSacolas from '../assets/historia/sacolas-atalia.webp'

export const FUNDADORA = {
  nome: 'Wirlla Dantas',
  papel: 'Bióloga, empreendedora e fundadora da Atalia Brechó',
  foto: fotoSorriso, // seção da página inicial
  fotoRetrato, // abertura de /nossa-historia
  fotoTrabalho,
  fotoSacolas,
  frase: 'Novas histórias para peças que ainda têm muito a oferecer.',
}

export const HISTORIA = {
  titulo: 'Uma história de coragem, aprendizado e propósito',
  resumo:
    'A Atalia nasceu em 2024, durante a licença-maternidade de Wirlla Dantas. Bióloga por formação, ela transformou um novo olhar sobre o futuro em um sonho: um negócio que unisse moda, consciência ambiental e transformação social.',
  abertura:
    'A Atalia nasceu do desejo de empreender com propósito e de transformar a maneira como nos relacionamos com a moda. Sua história começou em 2024, durante a licença-maternidade de sua fundadora, Wirlla Dantas, quando um novo olhar sobre o futuro, a maternidade e as possibilidades de empreender deu origem a um sonho: criar um negócio que unisse moda, consciência ambiental e transformação social.',
  trajetoria: [
    'Bióloga por formação, Wirlla sempre carregou consigo o olhar para o meio ambiente e a importância de repensar a relação entre consumo e sustentabilidade. Sua trajetória profissional também foi marcada por 16 anos de experiência na Companhia Pernambucana de Saneamento (Compesa), onde atuou na área administrativa e financeira, com vivência em processos de gestão, atendimento e compras.',
    'Essa combinação de conhecimentos e experiências contribuiu para a construção da Atalia: um brechó digital que nasceu do zero, com poucos recursos, disposição para aprender e a convicção de que era possível fazer diferente.',
  ],
  proposito: [
    'Mais do que comercializar roupas de segunda mão, a Atalia surgiu com a proposta de dar novas oportunidades às peças, incentivar o consumo consciente e mostrar que é possível unir estilo, economia e responsabilidade ambiental. Por meio da moda circular, cada peça ganha a possibilidade de continuar sua história, enquanto mais pessoas descobrem novas formas de consumir e empreender.',
    'Ao longo dessa jornada, a marca também passou a valorizar o protagonismo feminino, criando oportunidades para mulheres que desejam desapegar de roupas, gerar renda e participar de uma cadeia de consumo mais colaborativa.',
  ],
  nome: 'O nome Atalia, que carrega para sua fundadora o significado de “Deus é Exaltado”, representa também a fé que acompanha sua trajetória e a intenção de construir um negócio alinhado aos seus valores.',
  hoje:
    'Hoje, a Atalia é a expressão de uma jornada de coragem, aprendizado e propósito. Uma iniciativa que une a formação em Biologia, a experiência profissional e a vontade de contribuir para um futuro em que a moda seja cada vez mais consciente, acessível e responsável.',
  assinatura: 'Moda com propósito. Novas histórias para peças que ainda têm muito a oferecer.',
}

export const MARCOS = [
  { quando: 'Formação', oque: 'Bióloga, com o olhar voltado para o meio ambiente e para o consumo sustentável.' },
  { quando: '16 anos', oque: 'Na Compesa, nas áreas administrativa e financeira: gestão, atendimento e compras.' },
  { quando: '2024', oque: 'Durante a licença-maternidade, nasce a Atalia: um brechó digital criado do zero.' },
]

export const DIFERENCIAIS = [
  {
    titulo: 'Moda circular',
    texto: 'Cada peça ganha a possibilidade de continuar sua história, em vez de terminar parada no armário.',
  },
  {
    titulo: 'Protagonismo feminino',
    texto: 'Oportunidades para mulheres desapegarem, gerarem renda e fazerem parte de um consumo mais colaborativo.',
  },
  {
    titulo: 'Estilo, economia e responsabilidade',
    texto: 'Roupas selecionadas, com preço justo, mostrando que é possível consumir bem e com consciência.',
  },
]
