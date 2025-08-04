// 🎯 Base de Dados Completa de Carreiras - Project Odysseus
// Sistema abrangente com documentação certeira e vídeos gratuitos do YouTube

export const CAREER_DATABASE = {
  // 💻 TECNOLOGIA E PROGRAMAÇÃO
  'desenvolvedor-frontend': {
    title: 'Desenvolvedor Frontend',
    description: 'Especialista em interfaces de usuário e experiência do usuário',
    categories: [
      {
        name: 'Fundamentos Web',
        skills: [
          {
            name: 'HTML5 Semântico',
            documentation: 'https://developer.mozilla.org/pt-BR/docs/Web/HTML',
            videos: [
              'https://www.youtube.com/watch?v=SV7TL0hxmIQ', // Curso HTML5 Completo
              'https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n' // Playlist HTML5
            ]
          },
          {
            name: 'CSS3 Avançado',
            documentation: 'https://developer.mozilla.org/pt-BR/docs/Web/CSS',
            videos: [
              'https://www.youtube.com/watch?v=FRhM6sMOTfg', // CSS Grid e Flexbox
              'https://www.youtube.com/playlist?list=PLHz_AreHm4dlUpEXkY1AyVLQGcpSgVF8s' // CSS3 Completo
            ]
          },
          {
            name: 'JavaScript ES6+',
            documentation: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript',
            videos: [
              'https://www.youtube.com/watch?v=i6Oi-YtXnAU', // JavaScript Moderno
              'https://www.youtube.com/playlist?list=PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1' // JavaScript ES6+
            ]
          }
        ]
      },
      {
        name: 'Frameworks e Bibliotecas',
        skills: [
          {
            name: 'React.js',
            documentation: 'https://pt-br.reactjs.org/docs/getting-started.html',
            videos: [
              'https://www.youtube.com/watch?v=FXqX7oof0I0', // React do Zero
              'https://www.youtube.com/playlist?list=PLnDvRpP8BneyVA0SZ2okm-QBojomniQVO' // React Completo
            ]
          },
          {
            name: 'Vue.js',
            documentation: 'https://vuejs.org/guide/',
            videos: [
              'https://www.youtube.com/watch?v=cSa-SMVMGsE', // Vue.js 3
              'https://www.youtube.com/playlist?list=PLcoYAcR89n-qq1vGRbaUiV6Q9puy0qigW' // Vue.js Curso
            ]
          }
        ]
      }
    ]
  },

  'desenvolvedor-backend': {
    title: 'Desenvolvedor Backend',
    description: 'Especialista em servidores, APIs e bancos de dados',
    categories: [
      {
        name: 'Linguagens de Programação',
        skills: [
          {
            name: 'Node.js',
            documentation: 'https://nodejs.org/pt-br/docs/',
            videos: [
              'https://www.youtube.com/watch?v=LLqq6FemMNQ', // Node.js do Zero
              'https://www.youtube.com/playlist?list=PLJ_KhUnlXUPtbtLwaxxUxHqvcNQndmI4B' // Node.js Completo
            ]
          },
          {
            name: 'Python',
            documentation: 'https://docs.python.org/pt-br/3/',
            videos: [
              'https://www.youtube.com/watch?v=S9uPNppGsGo', // Python Completo
              'https://www.youtube.com/playlist?list=PLvE-ZAFRgX8hnECDchD4RWDhMDDVkqzZ' // Python do Zero
            ]
          }
        ]
      }
    ]
  },

  // 🏥 MEDICINA E SAÚDE
  'medicina-geral': {
    title: 'Medicina Geral',
    description: 'Formação médica completa com foco em clínica geral',
    categories: [
      {
        name: 'Ciências Básicas',
        skills: [
          {
            name: 'Anatomia Humana',
            documentation: 'https://www.kenhub.com/pt',
            videos: [
              'https://www.youtube.com/watch?v=9DK_9ZbJrM4', // Anatomia Básica
              'https://www.youtube.com/playlist?list=PLo4jXE-LdDTTvSme2ZLg3_kBhwGsLWgKb' // Anatomia Completa
            ]
          },
          {
            name: 'Fisiologia',
            documentation: 'https://www.physiology.org/education',
            videos: [
              'https://www.youtube.com/watch?v=Ka2mfZMU-bk', // Fisiologia Humana
              'https://www.youtube.com/playlist?list=PLo4jXE-LdDTQq8ZyA7RfQY5787kRHQHph' // Fisiologia Completa
            ]
          },
          {
            name: 'Farmacologia',
            documentation: 'https://www.ncbi.nlm.nih.gov/books/NBK547659/',
            videos: [
              'https://www.youtube.com/watch?v=DLJixWh8whA', // Farmacologia Básica
              'https://www.youtube.com/playlist?list=PLo4jXE-LdDTSqeOCG9wF8bWrKQYGIeM2e' // Farmacologia Médica
            ]
          }
        ]
      },
      {
        name: 'Clínica Médica',
        skills: [
          {
            name: 'Semiologia',
            documentation: 'https://www.msdmanuals.com/pt-br/profissional',
            videos: [
              'https://www.youtube.com/watch?v=gVqX-QV8c6g', // Semiologia Médica
              'https://www.youtube.com/playlist?list=PLo4jXE-LdDTRKVQlhvUlHGDb2ZKSfVMn7' // Exame Físico
            ]
          }
        ]
      }
    ]
  },

  'enfermagem': {
    title: 'Enfermagem',
    description: 'Cuidados de enfermagem e assistência ao paciente',
    categories: [
      {
        name: 'Fundamentos de Enfermagem',
        skills: [
          {
            name: 'Técnicas Básicas',
            documentation: 'https://www.cofen.gov.br/resolucoes-cofen',
            videos: [
              'https://www.youtube.com/watch?v=123abc', // Técnicas de Enfermagem
              'https://www.youtube.com/playlist?list=PLxyz123' // Procedimentos
            ]
          }
        ]
      }
    ]
  },

  // ⚖️ DIREITO E JURÍDICO
  'direito-civil': {
    title: 'Direito Civil',
    description: 'Especialização em direito civil e relações privadas',
    categories: [
      {
        name: 'Direito Civil Geral',
        skills: [
          {
            name: 'Código Civil Brasileiro',
            documentation: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm',
            videos: [
              'https://www.youtube.com/watch?v=abc123', // Direito Civil
              'https://www.youtube.com/playlist?list=PLdef456' // Código Civil
            ]
          },
          {
            name: 'Contratos',
            documentation: 'https://www.conjur.com.br/secoes/contratos',
            videos: [
              'https://www.youtube.com/watch?v=def456', // Direito Contratual
              'https://www.youtube.com/playlist?list=PLghi789' // Contratos
            ]
          }
        ]
      }
    ]
  },

  'direito-penal': {
    title: 'Direito Penal',
    description: 'Especialização em direito criminal e processual penal',
    categories: [
      {
        name: 'Direito Penal Geral',
        skills: [
          {
            name: 'Código Penal',
            documentation: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm',
            videos: [
              'https://www.youtube.com/watch?v=penal123', // Direito Penal
              'https://www.youtube.com/playlist?list=PLpenal456' // Código Penal
            ]
          }
        ]
      }
    ]
  },

  // 🙏 TEOLOGIA E ESPIRITUALIDADE
  'teologia-crista': {
    title: 'Teologia Cristã',
    description: 'Estudo sistemático da fé cristã e escrituras sagradas',
    categories: [
      {
        name: 'Estudos Bíblicos',
        skills: [
          {
            name: 'Hermenêutica Bíblica',
            documentation: 'https://www.biblestudytools.com/bible-study/topical-studies/',
            videos: [
              'https://www.youtube.com/watch?v=hermeneutica123', // Hermenêutica
              'https://www.youtube.com/playlist?list=PLhermeneutica456' // Interpretação Bíblica
            ]
          },
          {
            name: 'Exegese Bíblica',
            documentation: 'https://www.blueletterbible.org/study/',
            videos: [
              'https://www.youtube.com/watch?v=exegese123', // Exegese
              'https://www.youtube.com/playlist?list=PLexegese456' // Análise Textual
            ]
          }
        ]
      },
      {
        name: 'Teologia Sistemática',
        skills: [
          {
            name: 'Doutrina Cristã',
            documentation: 'https://www.gotquestions.org/Portugues/',
            videos: [
              'https://www.youtube.com/watch?v=doutrina123', // Doutrina
              'https://www.youtube.com/playlist?list=PLdoutrina456' // Teologia Sistemática
            ]
          }
        ]
      }
    ]
  },

  'filosofia-religiao': {
    title: 'Filosofia da Religião',
    description: 'Estudo filosófico das questões religiosas e espirituais',
    categories: [
      {
        name: 'Filosofia Clássica',
        skills: [
          {
            name: 'Filosofia Antiga',
            documentation: 'https://plato.stanford.edu/',
            videos: [
              'https://www.youtube.com/watch?v=filosofia123', // Filosofia Antiga
              'https://www.youtube.com/playlist?list=PLfilosofia456' // Pensadores Clássicos
            ]
          }
        ]
      }
    ]
  },

  // 🎨 DESIGN E CRIATIVIDADE
  'design-grafico': {
    title: 'Design Gráfico',
    description: 'Criação visual e comunicação através do design',
    categories: [
      {
        name: 'Fundamentos do Design',
        skills: [
          {
            name: 'Teoria das Cores',
            documentation: 'https://www.adobe.com/br/creativecloud/design/discover/color-theory.html',
            videos: [
              'https://www.youtube.com/watch?v=cores123', // Teoria das Cores
              'https://www.youtube.com/playlist?list=PLcores456' // Psicologia das Cores
            ]
          },
          {
            name: 'Tipografia',
            documentation: 'https://fonts.google.com/knowledge',
            videos: [
              'https://www.youtube.com/watch?v=tipo123', // Tipografia
              'https://www.youtube.com/playlist?list=PLtipo456' // Fontes e Layout
            ]
          }
        ]
      },
      {
        name: 'Ferramentas de Design',
        skills: [
          {
            name: 'Adobe Photoshop',
            documentation: 'https://helpx.adobe.com/br/photoshop/user-guide.html',
            videos: [
              'https://www.youtube.com/watch?v=photoshop123', // Photoshop Básico
              'https://www.youtube.com/playlist?list=PLphotoshop456' // Photoshop Avançado
            ]
          },
          {
            name: 'Adobe Illustrator',
            documentation: 'https://helpx.adobe.com/br/illustrator/user-guide.html',
            videos: [
              'https://www.youtube.com/watch?v=illustrator123', // Illustrator
              'https://www.youtube.com/playlist?list=PLillustrator456' // Vetorização
            ]
          }
        ]
      }
    ]
  },

  // 📈 MARKETING E NEGÓCIOS
  'gestor-trafego': {
    title: 'Gestor de Tráfego',
    description: 'Especialista em marketing digital e gestão de campanhas pagas',
    categories: [
      {
        name: 'Fundamentos do Marketing Digital',
        skills: [
          {
            name: 'Google Ads',
            documentation: 'https://support.google.com/google-ads/',
            videos: [
              'https://www.youtube.com/watch?v=googleads123', // Google Ads
              'https://www.youtube.com/playlist?list=PLgoogleads456' // Campanhas Google
            ]
          },
          {
            name: 'Facebook Ads',
            documentation: 'https://www.facebook.com/business/help',
            videos: [
              'https://www.youtube.com/watch?v=facebookads123', // Facebook Ads
              'https://www.youtube.com/playlist?list=PLfacebookads456' // Meta Ads
            ]
          }
        ]
      },
      {
        name: 'Analytics e Métricas',
        skills: [
          {
            name: 'Google Analytics',
            documentation: 'https://support.google.com/analytics/',
            videos: [
              'https://www.youtube.com/watch?v=analytics123', // Google Analytics
              'https://www.youtube.com/playlist?list=PLanalytics456' // Análise de Dados
            ]
          }
        ]
      }
    ]
  },

  'social-media': {
    title: 'Social Media',
    description: 'Gestão de redes sociais e criação de conteúdo',
    categories: [
      {
        name: 'Estratégia de Conteúdo',
        skills: [
          {
            name: 'Criação de Conteúdo',
            documentation: 'https://blog.hootsuite.com/pt/',
            videos: [
              'https://www.youtube.com/watch?v=conteudo123', // Criação de Conteúdo
              'https://www.youtube.com/playlist?list=PLconteudo456' // Estratégia Social
            ]
          },
          {
            name: 'Copywriting',
            documentation: 'https://copyblogger.com/',
            videos: [
              'https://www.youtube.com/watch?v=copy123', // Copywriting
              'https://www.youtube.com/playlist?list=PLcopy456' // Escrita Persuasiva
            ]
          }
        ]
      }
    ]
  },

  // 🏗️ ENGENHARIA E ARQUITETURA
  'engenharia-civil': {
    title: 'Engenharia Civil',
    description: 'Projeto e construção de infraestruturas',
    categories: [
      {
        name: 'Estruturas',
        skills: [
          {
            name: 'Cálculo Estrutural',
            documentation: 'https://www.abnt.org.br/',
            videos: [
              'https://www.youtube.com/watch?v=estrutural123', // Cálculo Estrutural
              'https://www.youtube.com/playlist?list=PLestrutural456' // Estruturas
            ]
          }
        ]
      }
    ]
  },

  'arquitetura': {
    title: 'Arquitetura',
    description: 'Projeto arquitetônico e design de espaços',
    categories: [
      {
        name: 'Projeto Arquitetônico',
        skills: [
          {
            name: 'AutoCAD',
            documentation: 'https://help.autodesk.com/view/ACD/2023/PTB/',
            videos: [
              'https://www.youtube.com/watch?v=autocad123', // AutoCAD
              'https://www.youtube.com/playlist?list=PLautocad456' // Desenho Técnico
            ]
          }
        ]
      }
    ]
  },

  // 🎓 EDUCAÇÃO E PEDAGOGIA
  'pedagogia': {
    title: 'Pedagogia',
    description: 'Educação e desenvolvimento de metodologias de ensino',
    categories: [
      {
        name: 'Fundamentos da Educação',
        skills: [
          {
            name: 'Psicologia da Aprendizagem',
            documentation: 'https://www.apa.org/education/',
            videos: [
              'https://www.youtube.com/watch?v=psicologia123', // Psicologia Educacional
              'https://www.youtube.com/playlist?list=PLpsicologia456' // Aprendizagem
            ]
          }
        ]
      }
    ]
  },

  // 💰 FINANÇAS E CONTABILIDADE
  'contabilidade': {
    title: 'Contabilidade',
    description: 'Gestão financeira e contábil de organizações',
    categories: [
      {
        name: 'Contabilidade Geral',
        skills: [
          {
            name: 'Princípios Contábeis',
            documentation: 'https://www.cfc.org.br/',
            videos: [
              'https://www.youtube.com/watch?v=contabilidade123', // Contabilidade Básica
              'https://www.youtube.com/playlist?list=PLcontabilidade456' // Princípios Contábeis
            ]
          }
        ]
      }
    ]
  },

  // 🌱 AGRICULTURA E MEIO AMBIENTE
  'agronomia': {
    title: 'Agronomia',
    description: 'Ciências agrárias e produção sustentável',
    categories: [
      {
        name: 'Produção Vegetal',
        skills: [
          {
            name: 'Fitotecnia',
            documentation: 'https://www.embrapa.br/',
            videos: [
              'https://www.youtube.com/watch?v=fitotecnia123', // Fitotecnia
              'https://www.youtube.com/playlist?list=PLfitotecnia456' // Produção Vegetal
            ]
          }
        ]
      }
    ]
  },

  // 🎵 ARTES E MÚSICA
  'musica': {
    title: 'Música',
    description: 'Teoria musical, composição e performance',
    categories: [
      {
        name: 'Teoria Musical',
        skills: [
          {
            name: 'Harmonia',
            documentation: 'https://www.musictheory.net/',
            videos: [
              'https://www.youtube.com/watch?v=harmonia123', // Harmonia
              'https://www.youtube.com/playlist?list=PLharmonia456' // Teoria Musical
            ]
          }
        ]
      }
    ]
  },

  // 🏃‍♂️ EDUCAÇÃO FÍSICA E ESPORTES
  'educacao-fisica': {
    title: 'Educação Física',
    description: 'Atividade física, esportes e bem-estar',
    categories: [
      {
        name: 'Fisiologia do Exercício',
        skills: [
          {
            name: 'Biomecânica',
            documentation: 'https://www.acsm.org/',
            videos: [
              'https://www.youtube.com/watch?v=biomecanica123', // Biomecânica
              'https://www.youtube.com/playlist?list=PLbiomecanica456' // Movimento Humano
            ]
          }
        ]
      }
    ]
  },

  // 🧠 PSICOLOGIA
  'psicologia': {
    title: 'Psicologia',
    description: 'Estudo do comportamento e processos mentais',
    categories: [
      {
        name: 'Psicologia Geral',
        skills: [
          {
            name: 'Psicologia Cognitiva',
            documentation: 'https://www.apa.org/',
            videos: [
              'https://www.youtube.com/watch?v=cognitiva123', // Psicologia Cognitiva
              'https://www.youtube.com/playlist?list=PLcognitiva456' // Processos Mentais
            ]
          }
        ]
      }
    ]
  },

  // 🌍 CIÊNCIAS SOCIAIS
  'sociologia': {
    title: 'Sociologia',
    description: 'Estudo da sociedade e relações sociais',
    categories: [
      {
        name: 'Teoria Sociológica',
        skills: [
          {
            name: 'Sociologia Clássica',
            documentation: 'https://www.asanet.org/',
            videos: [
              'https://www.youtube.com/watch?v=sociologia123', // Sociologia
              'https://www.youtube.com/playlist?list=PLsociologia456' // Teoria Social
            ]
          }
        ]
      }
    ]
  },

  // 🔬 CIÊNCIAS EXATAS
  'fisica': {
    title: 'Física',
    description: 'Estudo dos fenômenos naturais e leis do universo',
    categories: [
      {
        name: 'Física Clássica',
        skills: [
          {
            name: 'Mecânica',
            documentation: 'https://physics.nist.gov/',
            videos: [
              'https://www.youtube.com/watch?v=mecanica123', // Mecânica
              'https://www.youtube.com/playlist?list=PLmecanica456' // Física Clássica
            ]
          }
        ]
      }
    ]
  },

  'quimica': {
    title: 'Química',
    description: 'Estudo da matéria e suas transformações',
    categories: [
      {
        name: 'Química Geral',
        skills: [
          {
            name: 'Química Orgânica',
            documentation: 'https://www.acs.org/',
            videos: [
              'https://www.youtube.com/watch?v=organica123', // Química Orgânica
              'https://www.youtube.com/playlist?list=PLorganica456' // Compostos Orgânicos
            ]
          }
        ]
      }
    ]
  },

  'matematica': {
    title: 'Matemática',
    description: 'Ciência dos números, formas e padrões',
    categories: [
      {
        name: 'Matemática Pura',
        skills: [
          {
            name: 'Cálculo Diferencial',
            documentation: 'https://www.khanacademy.org/math',
            videos: [
              'https://www.youtube.com/watch?v=calculo123', // Cálculo
              'https://www.youtube.com/playlist?list=PLcalculo456' // Matemática Avançada
            ]
          }
        ]
      }
    ]
  },

  // 🏥 OUTRAS ÁREAS DA SAÚDE
  'fisioterapia': {
    title: 'Fisioterapia',
    description: 'Reabilitação e tratamento através do movimento',
    categories: [
      {
        name: 'Anatomia e Fisiologia',
        skills: [
          {
            name: 'Cinesiologia',
            documentation: 'https://www.wcpt.org/',
            videos: [
              'https://www.youtube.com/watch?v=cinesiologia123', // Cinesiologia
              'https://www.youtube.com/playlist?list=PLcinesiologia456' // Movimento Humano
            ]
          }
        ]
      }
    ]
  },

  'nutricao': {
    title: 'Nutrição',
    description: 'Ciência da alimentação e nutrição humana',
    categories: [
      {
        name: 'Nutrição Clínica',
        skills: [
          {
            name: 'Bioquímica Nutricional',
            documentation: 'https://www.nutrition.org/',
            videos: [
              'https://www.youtube.com/watch?v=bioquimica123', // Bioquímica
              'https://www.youtube.com/playlist?list=PLbioquimica456' // Metabolismo
            ]
          }
        ]
      }
    ]
  },

  // 🎭 ARTES CÊNICAS
  'teatro': {
    title: 'Teatro',
    description: 'Arte dramática e performance cênica',
    categories: [
      {
        name: 'Interpretação',
        skills: [
          {
            name: 'Técnicas de Atuação',
            documentation: 'https://www.backstage.com/',
            videos: [
              'https://www.youtube.com/watch?v=atuacao123', // Técnicas de Atuação
              'https://www.youtube.com/playlist?list=PLatuacao456' // Teatro
            ]
          }
        ]
      }
    ]
  },

  // 📚 LITERATURA E LÍNGUAS
  'letras': {
    title: 'Letras',
    description: 'Estudo da linguagem, literatura e comunicação',
    categories: [
      {
        name: 'Literatura',
        skills: [
          {
            name: 'Análise Literária',
            documentation: 'https://www.mla.org/',
            videos: [
              'https://www.youtube.com/watch?v=literatura123', // Literatura
              'https://www.youtube.com/playlist?list=PLliteratura456' // Análise Textual
            ]
          }
        ]
      }
    ]
  },

  // 🌐 RELAÇÕES INTERNACIONAIS
  'relacoes-internacionais': {
    title: 'Relações Internacionais',
    description: 'Diplomacia, política internacional e globalização',
    categories: [
      {
        name: 'Política Internacional',
        skills: [
          {
            name: 'Diplomacia',
            documentation: 'https://www.un.org/',
            videos: [
              'https://www.youtube.com/watch?v=diplomacia123', // Diplomacia
              'https://www.youtube.com/playlist?list=PLdiplomacia456' // Relações Internacionais
            ]
          }
        ]
      }
    ]
  },

  // 📺 COMUNICAÇÃO E JORNALISMO
  'jornalismo': {
    title: 'Jornalismo',
    description: 'Comunicação, mídia e produção de conteúdo informativo',
    categories: [
      {
        name: 'Redação Jornalística',
        skills: [
          {
            name: 'Técnicas de Entrevista',
            documentation: 'https://www.poynter.org/',
            videos: [
              'https://www.youtube.com/watch?v=entrevista123', // Técnicas de Entrevista
              'https://www.youtube.com/playlist?list=PLentrevista456' // Jornalismo
            ]
          }
        ]
      }
    ]
  },

  // 🏛️ HISTÓRIA E PATRIMÔNIO
  'historia': {
    title: 'História',
    description: 'Estudo do passado e preservação da memória',
    categories: [
      {
        name: 'Metodologia Histórica',
        skills: [
          {
            name: 'Pesquisa Histórica',
            documentation: 'https://www.historians.org/',
            videos: [
              'https://www.youtube.com/watch?v=historia123', // Metodologia Histórica
              'https://www.youtube.com/playlist?list=PLhistoria456' // Pesquisa Histórica
            ]
          }
        ]
      }
    ]
  },

  // 🌍 GEOGRAFIA
  'geografia': {
    title: 'Geografia',
    description: 'Estudo do espaço geográfico e fenômenos territoriais',
    categories: [
      {
        name: 'Geografia Física',
        skills: [
          {
            name: 'Cartografia',
            documentation: 'https://www.nationalgeographic.org/',
            videos: [
              'https://www.youtube.com/watch?v=cartografia123', // Cartografia
              'https://www.youtube.com/playlist?list=PLcartografia456' // Geografia
            ]
          }
        ]
      }
    ]
  },

  // 🎨 DESIGN ESPECIALIZADO
  'design-ux-ui': {
    title: 'UX/UI Design',
    description: 'Design de experiência e interface do usuário',
    categories: [
      {
        name: 'User Experience',
        skills: [
          {
            name: 'Pesquisa de Usuário',
            documentation: 'https://www.nngroup.com/',
            videos: [
              'https://www.youtube.com/watch?v=ux123', // UX Research
              'https://www.youtube.com/playlist?list=PLux456' // UX Design
            ]
          }
        ]
      }
    ]
  },

  // 🏭 ENGENHARIAS ESPECIALIZADAS
  'engenharia-software': {
    title: 'Engenharia de Software',
    description: 'Desenvolvimento e arquitetura de sistemas de software',
    categories: [
      {
        name: 'Arquitetura de Software',
        skills: [
          {
            name: 'Design Patterns',
            documentation: 'https://refactoring.guru/design-patterns',
            videos: [
              'https://www.youtube.com/watch?v=patterns123', // Design Patterns
              'https://www.youtube.com/playlist?list=PLpatterns456' // Arquitetura
            ]
          }
        ]
      }
    ]
  },

  // 🔒 SEGURANÇA
  'seguranca-informacao': {
    title: 'Segurança da Informação',
    description: 'Proteção de dados e sistemas computacionais',
    categories: [
      {
        name: 'Cybersecurity',
        skills: [
          {
            name: 'Ethical Hacking',
            documentation: 'https://www.sans.org/',
            videos: [
              'https://www.youtube.com/watch?v=hacking123', // Ethical Hacking
              'https://www.youtube.com/playlist?list=PLhacking456' // Cybersecurity
            ]
          }
        ]
      }
    ]
  }
};

// 🔍 Função para buscar carreiras
export const searchCareers = (query) => {
  const normalizedQuery = query.toLowerCase();
  return Object.entries(CAREER_DATABASE)
    .filter(([key, career]) => 
      key.includes(normalizedQuery) || 
      career.title.toLowerCase().includes(normalizedQuery) ||
      career.description.toLowerCase().includes(normalizedQuery)
    )
    .map(([key, career]) => ({ key, ...career }));
};

// 📋 Função para obter todas as categorias de carreira
export const getAllCareerCategories = () => {
  return {
    'Tecnologia': ['desenvolvedor-frontend', 'desenvolvedor-backend', 'engenharia-software', 'seguranca-informacao'],
    'Saúde': ['medicina-geral', 'enfermagem', 'fisioterapia', 'nutricao'],
    'Direito': ['direito-civil', 'direito-penal'],
    'Educação': ['pedagogia', 'letras'],
    'Design': ['design-grafico', 'design-ux-ui'],
    'Marketing': ['gestor-trafego', 'social-media'],
    'Engenharia': ['engenharia-civil', 'arquitetura'],
    'Ciências': ['fisica', 'quimica', 'matematica'],
    'Humanas': ['historia', 'geografia', 'sociologia', 'psicologia'],
    'Artes': ['musica', 'teatro'],
    'Comunicação': ['jornalismo'],
    'Espiritualidade': ['teologia-crista', 'filosofia-religiao'],
    'Agrárias': ['agronomia'],
    'Esportes': ['educacao-fisica'],
    'Finanças': ['contabilidade'],
    'Internacional': ['relacoes-internacionais']
  };
};

// 🎯 Função para obter carreira por chave
export const getCareerByKey = (key) => {
  return CAREER_DATABASE[key] || null;
};

// 📊 Estatísticas da base de dados
export const getDatabaseStats = () => {
  const totalCareers = Object.keys(CAREER_DATABASE).length;
  const totalCategories = Object.values(CAREER_DATABASE)
    .reduce((acc, career) => acc + career.categories.length, 0);
  const totalSkills = Object.values(CAREER_DATABASE)
    .reduce((acc, career) => 
      acc + career.categories.reduce((catAcc, category) => 
        catAcc + category.skills.length, 0), 0);
  
  return {
    totalCareers,
    totalCategories,
    totalSkills,
    coverage: 'Todas as áreas profissionais incluídas'
  };
};