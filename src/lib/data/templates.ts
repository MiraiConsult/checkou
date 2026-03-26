export interface TemplateItem {
  id: string;
  question: string;
  required_evidence: boolean;
}

export interface TemplateSection {
  id: string;
  name: string;
  items: TemplateItem[];
}

export interface FullTemplate {
  id: string;
  icon: string;
  name: string;
  version: string;
  description: string;
  color: string;
  sections: TemplateSection[];
}

export const templateData: FullTemplate[] = [
  {
    id: "1",
    icon: "restaurant",
    name: "Abertura de Restaurante",
    version: "2.1",
    description: "Verificações de abertura para operação diária",
    color: "bg-orange-50 text-orange-600",
    sections: [
      {
        id: "s1", name: "Recepção", items: [
          { id: "1-1", question: "Área de recepção está limpa e organizada?", required_evidence: false },
          { id: "1-2", question: "Materiais de divulgação estão atualizados?", required_evidence: false },
          { id: "1-3", question: "Sistema de reservas está funcionando?", required_evidence: false },
          { id: "1-4", question: "Uniforme da equipe está adequado?", required_evidence: true },
          { id: "1-5", question: "Música ambiente está ligada no volume correto?", required_evidence: false },
        ],
      },
      {
        id: "s2", name: "Cozinha", items: [
          { id: "2-1", question: "Equipamentos foram higienizados?", required_evidence: true },
          { id: "2-2", question: "Temperatura da câmara fria está adequada?", required_evidence: true },
          { id: "2-3", question: "Alimentos armazenados corretamente?", required_evidence: true },
          { id: "2-4", question: "Lixeiras estão limpas e identificadas?", required_evidence: false },
          { id: "2-5", question: "Bancadas sanitizadas?", required_evidence: true },
          { id: "2-6", question: "Estoque de insumos do dia verificado?", required_evidence: false },
          { id: "2-7", question: "Ralos da cozinha estão limpos?", required_evidence: false },
        ],
      },
      {
        id: "s3", name: "Salão", items: [
          { id: "3-1", question: "Mesas e cadeiras estão limpas?", required_evidence: false },
          { id: "3-2", question: "Iluminação está funcionando?", required_evidence: false },
          { id: "3-3", question: "Cardápios estão em bom estado?", required_evidence: false },
          { id: "3-4", question: "Piso está limpo e seco?", required_evidence: false },
          { id: "3-5", question: "Condimentos das mesas estão abastecidos?", required_evidence: false },
          { id: "3-6", question: "Ar-condicionado funcionando corretamente?", required_evidence: false },
        ],
      },
      {
        id: "s4", name: "Banheiros", items: [
          { id: "4-1", question: "Banheiros estão limpos e abastecidos?", required_evidence: true },
          { id: "4-2", question: "Ralos estão limpos e sem obstrução?", required_evidence: false },
          { id: "4-3", question: "Sabonete e papel toalha repostos?", required_evidence: false },
          { id: "4-4", question: "Lixeiras esvaziadas?", required_evidence: false },
          { id: "4-5", question: "Espelhos e pias limpos?", required_evidence: false },
        ],
      },
      {
        id: "s5", name: "Segurança", items: [
          { id: "5-1", question: "Extintores estão no prazo de validade?", required_evidence: true },
          { id: "5-2", question: "Saídas de emergência estão desobstruídas?", required_evidence: true },
          { id: "5-3", question: "Câmeras de segurança funcionando?", required_evidence: false },
          { id: "5-4", question: "Kit de primeiros socorros completo?", required_evidence: false },
          { id: "5-5", question: "Sinalização de segurança visível?", required_evidence: false },
        ],
      },
    ],
  },
  {
    id: "2",
    icon: "cleaning_services",
    name: "Higienização Cozinha",
    version: "1.3",
    description: "Protocolo de limpeza e sanitização da cozinha",
    color: "bg-blue-50 text-blue-600",
    sections: [
      {
        id: "s1", name: "Superfícies", items: [
          { id: "1-1", question: "Bancadas de preparo sanitizadas?", required_evidence: true },
          { id: "1-2", question: "Tábuas de corte higienizadas e separadas por cor?", required_evidence: true },
          { id: "1-3", question: "Pia de lavagem limpa e sem resíduos?", required_evidence: false },
          { id: "1-4", question: "Superfícies de inox polidas?", required_evidence: false },
          { id: "1-5", question: "Azulejos das paredes sem gordura?", required_evidence: false },
        ],
      },
      {
        id: "s2", name: "Equipamentos", items: [
          { id: "2-1", question: "Fogão e chapa limpos e sem resíduos?", required_evidence: true },
          { id: "2-2", question: "Fritadeira sem acúmulo de óleo?", required_evidence: true },
          { id: "2-3", question: "Forno limpo internamente?", required_evidence: true },
          { id: "2-4", question: "Coifa e exaustores sem gordura?", required_evidence: true },
          { id: "2-5", question: "Micro-ondas limpo?", required_evidence: false },
          { id: "2-6", question: "Liquidificadores e processadores higienizados?", required_evidence: false },
        ],
      },
      {
        id: "s3", name: "Refrigeração", items: [
          { id: "3-1", question: "Geladeiras limpas e organizadas?", required_evidence: true },
          { id: "3-2", question: "Câmara fria sem gelo acumulado?", required_evidence: true },
          { id: "3-3", question: "Borrachas de vedação em bom estado?", required_evidence: false },
          { id: "3-4", question: "Temperatura dos equipamentos registrada?", required_evidence: true },
          { id: "3-5", question: "Freezers sem acúmulo de gelo?", required_evidence: false },
          { id: "3-6", question: "Alimentos com etiqueta de validade?", required_evidence: true },
        ],
      },
      {
        id: "s4", name: "Piso e Ralos", items: [
          { id: "4-1", question: "Piso lavado e seco?", required_evidence: false },
          { id: "4-2", question: "Ralos limpos e sem obstrução?", required_evidence: true },
          { id: "4-3", question: "Rodapés limpos?", required_evidence: false },
          { id: "4-4", question: "Rejuntes sem mofo?", required_evidence: false },
          { id: "4-5", question: "Tapetes antiderrapantes limpos?", required_evidence: false },
        ],
      },
    ],
  },
  {
    id: "3",
    icon: "security",
    name: "Segurança Noturna",
    version: "1.0",
    description: "Checklist de segurança para fechamento noturno",
    color: "bg-purple-50 text-purple-600",
    sections: [
      {
        id: "s1", name: "Fechamento Geral", items: [
          { id: "1-1", question: "Todas as portas trancadas?", required_evidence: false },
          { id: "1-2", question: "Janelas fechadas e travadas?", required_evidence: false },
          { id: "1-3", question: "Alarme ativado?", required_evidence: true },
          { id: "1-4", question: "Luzes externas ligadas?", required_evidence: false },
          { id: "1-5", question: "Portão do estacionamento fechado?", required_evidence: true },
        ],
      },
      {
        id: "s2", name: "Equipamentos", items: [
          { id: "2-1", question: "Fogões e fornos desligados?", required_evidence: true },
          { id: "2-2", question: "Gás cortado na válvula principal?", required_evidence: true },
          { id: "2-3", question: "Fritadeiras desligadas e cobertas?", required_evidence: false },
          { id: "2-4", question: "Ar-condicionado desligado?", required_evidence: false },
          { id: "2-5", question: "Máquinas de café desligadas?", required_evidence: false },
        ],
      },
      {
        id: "s3", name: "Segurança", items: [
          { id: "3-1", question: "Câmeras de segurança funcionando?", required_evidence: true },
          { id: "3-2", question: "Sensores de movimento ativos?", required_evidence: false },
          { id: "3-3", question: "Iluminação de emergência testada?", required_evidence: false },
          { id: "3-4", question: "Cofre trancado?", required_evidence: true },
          { id: "3-5", question: "Ronda final no perímetro realizada?", required_evidence: true },
        ],
      },
    ],
  },
  {
    id: "4",
    icon: "thermostat",
    name: "Controle de Temperatura",
    version: "3.0",
    description: "Monitoramento de temperatura de equipamentos e alimentos",
    color: "bg-red-50 text-red-600",
    sections: [
      {
        id: "s1", name: "Câmaras Frias", items: [
          { id: "1-1", question: "Câmara fria #1 entre -18°C e -22°C?", required_evidence: true },
          { id: "1-2", question: "Câmara fria #2 entre -18°C e -22°C?", required_evidence: true },
          { id: "1-3", question: "Porta vedando corretamente?", required_evidence: false },
          { id: "1-4", question: "Condensador limpo?", required_evidence: false },
          { id: "1-5", question: "Degelo automático funcionando?", required_evidence: false },
        ],
      },
      {
        id: "s2", name: "Geladeiras", items: [
          { id: "2-1", question: "Geladeira de laticínios entre 2°C e 5°C?", required_evidence: true },
          { id: "2-2", question: "Geladeira de carnes entre 0°C e 2°C?", required_evidence: true },
          { id: "2-3", question: "Geladeira de bebidas entre 4°C e 7°C?", required_evidence: true },
          { id: "2-4", question: "Geladeira de hortifruti entre 5°C e 8°C?", required_evidence: true },
          { id: "2-5", question: "Balcão refrigerado entre 2°C e 7°C?", required_evidence: true },
          { id: "2-6", question: "Sem alimentos vencidos?", required_evidence: true },
        ],
      },
      {
        id: "s3", name: "Equipamentos Quentes", items: [
          { id: "3-1", question: "Banho-maria acima de 60°C?", required_evidence: true },
          { id: "3-2", question: "Estufa acima de 60°C?", required_evidence: true },
          { id: "3-3", question: "Pass-through aquecido?", required_evidence: false },
          { id: "3-4", question: "Sopa/caldo acima de 74°C na cocção?", required_evidence: true },
          { id: "3-5", question: "Óleo da fritadeira abaixo de 180°C?", required_evidence: true },
        ],
      },
      {
        id: "s4", name: "Alimentos Preparados", items: [
          { id: "4-1", question: "Proteínas atingiram 74°C no centro?", required_evidence: true },
          { id: "4-2", question: "Resfriamento rápido em menos de 2h?", required_evidence: true },
          { id: "4-3", question: "Alimentos tampados e etiquetados?", required_evidence: true },
          { id: "4-4", question: "Temperatura registrada na planilha?", required_evidence: false },
          { id: "4-5", question: "Sobras descartadas corretamente?", required_evidence: false },
          { id: "4-6", question: "Etiquetas de validade atualizadas?", required_evidence: false },
        ],
      },
      {
        id: "s5", name: "Transporte", items: [
          { id: "5-1", question: "Veículo refrigerado entre 0°C e 5°C?", required_evidence: true },
          { id: "5-2", question: "Caixas isotérmicas com gelo?", required_evidence: false },
          { id: "5-3", question: "Tempo de transporte dentro do limite?", required_evidence: false },
          { id: "5-4", question: "Registro de temperatura no recebimento?", required_evidence: true },
          { id: "5-5", question: "Embalagens íntegras?", required_evidence: true },
        ],
      },
      {
        id: "s6", name: "Calibração", items: [
          { id: "6-1", question: "Termômetros calibrados?", required_evidence: true },
          { id: "6-2", question: "Data de calibração dentro da validade?", required_evidence: true },
          { id: "6-3", question: "Certificado de calibração disponível?", required_evidence: false },
          { id: "6-4", question: "Termômetros de backup disponíveis?", required_evidence: false },
          { id: "6-5", question: "Sensores automáticos funcionando?", required_evidence: false },
          { id: "6-6", question: "Registro de temperaturas preenchido?", required_evidence: false },
        ],
      },
    ],
  },
  {
    id: "5",
    icon: "inventory_2",
    name: "Inventário Semanal",
    version: "1.2",
    description: "Contagem e verificação de estoque semanal",
    color: "bg-green-50 text-green-600",
    sections: [
      {
        id: "s1", name: "Proteínas", items: [
          { id: "1-1", question: "Contagem de carnes bovinas confere?", required_evidence: false },
          { id: "1-2", question: "Contagem de aves confere?", required_evidence: false },
          { id: "1-3", question: "Contagem de peixes confere?", required_evidence: false },
          { id: "1-4", question: "Contagem de embutidos confere?", required_evidence: false },
          { id: "1-5", question: "Validade de todas as proteínas OK?", required_evidence: true },
        ],
      },
      {
        id: "s2", name: "Hortifruti", items: [
          { id: "2-1", question: "Contagem de legumes confere?", required_evidence: false },
          { id: "2-2", question: "Contagem de verduras confere?", required_evidence: false },
          { id: "2-3", question: "Contagem de frutas confere?", required_evidence: false },
          { id: "2-4", question: "Itens com qualidade visual boa?", required_evidence: true },
          { id: "2-5", question: "Armazenamento FIFO correto?", required_evidence: false },
        ],
      },
      {
        id: "s3", name: "Secos e Grãos", items: [
          { id: "3-1", question: "Contagem de arroz/massas confere?", required_evidence: false },
          { id: "3-2", question: "Contagem de feijão/grãos confere?", required_evidence: false },
          { id: "3-3", question: "Contagem de farinhas confere?", required_evidence: false },
          { id: "3-4", question: "Contagem de óleos/azeites confere?", required_evidence: false },
          { id: "3-5", question: "Embalagens sem danos?", required_evidence: false },
        ],
      },
      {
        id: "s4", name: "Bebidas e Descartáveis", items: [
          { id: "4-1", question: "Contagem de bebidas confere?", required_evidence: false },
          { id: "4-2", question: "Contagem de descartáveis confere?", required_evidence: false },
          { id: "4-3", question: "Contagem de produtos de limpeza confere?", required_evidence: false },
          { id: "4-4", question: "Nível mínimo de estoque atendido?", required_evidence: false },
          { id: "4-5", question: "Pedido de reposição necessário?", required_evidence: false },
        ],
      },
    ],
  },
];
