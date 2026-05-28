export interface ModelTemplate {
  name: string;
  description: string;
  icon: string;
  category: string;
  sections: { name: string; items: { id: string; question: string; required_evidence: boolean }[] }[];
}

export const modelTemplates: ModelTemplate[] = [
  {
    name: "Abertura de Restaurante",
    description: "Verificações de abertura para operação diária",
    icon: "restaurant",
    category: "Restaurante",
    sections: [
      { name: "Recepção", items: [
        { id: "1", question: "Área de recepção limpa e organizada?", required_evidence: false },
        { id: "2", question: "Materiais de divulgação atualizados?", required_evidence: false },
        { id: "3", question: "Sistema de reservas funcionando?", required_evidence: false },
      ]},
      { name: "Cozinha", items: [
        { id: "4", question: "Equipamentos higienizados?", required_evidence: true },
        { id: "5", question: "Câmara fria entre -18°C e -22°C?", required_evidence: true },
        { id: "6", question: "Alimentos armazenados corretamente?", required_evidence: true },
        { id: "7", question: "Lixeiras limpas e identificadas?", required_evidence: false },
      ]},
      { name: "Salão", items: [
        { id: "8", question: "Mesas e cadeiras limpas?", required_evidence: false },
        { id: "9", question: "Iluminação funcionando?", required_evidence: false },
        { id: "10", question: "Ar-condicionado funcionando?", required_evidence: false },
      ]},
      { name: "Banheiros", items: [
        { id: "11", question: "Banheiros limpos e abastecidos?", required_evidence: true },
        { id: "12", question: "Ralos limpos?", required_evidence: false },
      ]},
      { name: "Segurança", items: [
        { id: "13", question: "Extintores no prazo?", required_evidence: true },
        { id: "14", question: "Saídas de emergência desobstruídas?", required_evidence: true },
      ]},
    ],
  },
  {
    name: "Higienização de Cozinha",
    description: "Protocolo de limpeza e sanitização completo",
    icon: "cleaning_services",
    category: "Higiene",
    sections: [
      { name: "Superfícies", items: [
        { id: "1", question: "Bancadas de preparo sanitizadas?", required_evidence: true },
        { id: "2", question: "Tábuas de corte higienizadas por cor?", required_evidence: true },
        { id: "3", question: "Pia sem resíduos?", required_evidence: false },
      ]},
      { name: "Equipamentos", items: [
        { id: "4", question: "Fogão e chapa limpos?", required_evidence: true },
        { id: "5", question: "Fritadeira sem acúmulo de óleo?", required_evidence: true },
        { id: "6", question: "Coifa e exaustores sem gordura?", required_evidence: true },
      ]},
      { name: "Refrigeração", items: [
        { id: "7", question: "Geladeiras limpas e organizadas?", required_evidence: true },
        { id: "8", question: "Temperatura registrada?", required_evidence: true },
        { id: "9", question: "Alimentos etiquetados com validade?", required_evidence: true },
      ]},
      { name: "Piso e Ralos", items: [
        { id: "10", question: "Piso lavado e seco?", required_evidence: false },
        { id: "11", question: "Ralos limpos?", required_evidence: true },
      ]},
    ],
  },
  {
    name: "Segurança Noturna",
    description: "Checklist de fechamento e segurança noturna",
    icon: "security",
    category: "Segurança",
    sections: [
      { name: "Fechamento", items: [
        { id: "1", question: "Todas as portas trancadas?", required_evidence: false },
        { id: "2", question: "Janelas fechadas e travadas?", required_evidence: false },
        { id: "3", question: "Alarme ativado?", required_evidence: true },
        { id: "4", question: "Portão do estacionamento fechado?", required_evidence: true },
      ]},
      { name: "Equipamentos", items: [
        { id: "5", question: "Fogões e fornos desligados?", required_evidence: true },
        { id: "6", question: "Gás cortado na válvula principal?", required_evidence: true },
        { id: "7", question: "Ar-condicionado desligado?", required_evidence: false },
      ]},
      { name: "Segurança", items: [
        { id: "8", question: "Câmeras funcionando?", required_evidence: true },
        { id: "9", question: "Cofre trancado?", required_evidence: true },
        { id: "10", question: "Ronda final realizada?", required_evidence: true },
      ]},
    ],
  },
  {
    name: "Controle de Temperatura",
    description: "Monitoramento de temperatura de equipamentos e alimentos",
    icon: "thermostat",
    category: "Qualidade",
    sections: [
      { name: "Câmaras Frias", items: [
        { id: "1", question: "Câmara fria #1 entre -18°C e -22°C?", required_evidence: true },
        { id: "2", question: "Câmara fria #2 entre -18°C e -22°C?", required_evidence: true },
        { id: "3", question: "Porta vedando corretamente?", required_evidence: false },
      ]},
      { name: "Geladeiras", items: [
        { id: "4", question: "Geladeira de laticínios entre 2°C e 5°C?", required_evidence: true },
        { id: "5", question: "Geladeira de carnes entre 0°C e 2°C?", required_evidence: true },
        { id: "6", question: "Sem alimentos vencidos?", required_evidence: true },
      ]},
      { name: "Equipamentos Quentes", items: [
        { id: "7", question: "Banho-maria acima de 60°C?", required_evidence: true },
        { id: "8", question: "Óleo da fritadeira abaixo de 180°C?", required_evidence: true },
      ]},
    ],
  },
  {
    name: "Inventário Semanal",
    description: "Contagem e verificação de estoque semanal",
    icon: "inventory_2",
    category: "Estoque",
    sections: [
      { name: "Proteínas", items: [
        { id: "1", question: "Contagem de carnes confere?", required_evidence: false },
        { id: "2", question: "Contagem de aves confere?", required_evidence: false },
        { id: "3", question: "Validade OK?", required_evidence: true },
      ]},
      { name: "Hortifruti", items: [
        { id: "4", question: "Contagem de legumes confere?", required_evidence: false },
        { id: "5", question: "Qualidade visual boa?", required_evidence: true },
      ]},
      { name: "Secos e Grãos", items: [
        { id: "6", question: "Contagem de arroz/massas confere?", required_evidence: false },
        { id: "7", question: "Embalagens sem danos?", required_evidence: false },
      ]},
      { name: "Bebidas e Descartáveis", items: [
        { id: "8", question: "Contagem de bebidas confere?", required_evidence: false },
        { id: "9", question: "Nível mínimo de estoque atendido?", required_evidence: false },
      ]},
    ],
  },
];
