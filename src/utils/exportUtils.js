import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Exportar para PDF
export const exportToPDF = (skillTreeData) => {
  // Configuração inicial com encoding UTF-8
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });
  
  // Configurações de página
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const footerHeight = 25;
  const headerHeight = 70;
  let yPosition = margin;
  
  // Cores profissionais
  const colors = {
    primary: [26, 35, 126],      // Azul escuro profissional
    secondary: [16, 185, 129],   // Verde esmeralda
    accent: [99, 102, 241],      // Índigo
    text: [17, 24, 39],          // Cinza muito escuro
    lightText: [75, 85, 99],     // Cinza médio
    background: [248, 250, 252], // Cinza muito claro
    white: [255, 255, 255]
  };
  
  // Função para limpar texto e evitar caracteres problemáticos
  const cleanText = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/g, ' ') // Substitui espaços especiais
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim();
  };
  
  // Função para verificar se precisa de nova página
  const checkNewPage = (requiredSpace = 15) => {
    if (yPosition + requiredSpace > pageHeight - footerHeight - 10) {
      addFooter();
      pdf.addPage();
      addHeader();
      return true;
    }
    return false;
  };
  
  // Função para adicionar cabeçalho profissional
  const addHeader = () => {
    // Fundo gradiente do cabeçalho
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Linha decorativa
    pdf.setFillColor(...colors.secondary);
    pdf.rect(0, headerHeight - 4, pageWidth, 4, 'F');
    
    // Logo/Título principal
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    const titleText = cleanText('PROJECT ODYSSEUS');
    pdf.text(titleText, pageWidth / 2, 30, { align: 'center' });
    
    // Subtítulo
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    const subtitleText = cleanText('Mapa de Habilidades Personalizado');
    pdf.text(subtitleText, pageWidth / 2, 45, { align: 'center' });
    
    // Data de geração
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateText = cleanText(`Gerado em: ${currentDate}`);
    pdf.text(dateText, pageWidth / 2, 58, { align: 'center' });
    
    yPosition = headerHeight + 15;
  };
  
  // Função para adicionar rodapé
  const addFooter = () => {
    const currentPage = pdf.internal.getCurrentPageInfo().pageNumber;
    const totalPages = pdf.internal.getNumberOfPages();
    
    // Linha decorativa
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.8);
    pdf.line(margin, pageHeight - footerHeight + 5, pageWidth - margin, pageHeight - footerHeight + 5);
    
    // Configurar texto do rodapé
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.lightText);
    
    // Copyright (esquerda)
    const copyrightText = cleanText('Copyright 2025 João Lucas de Oliveira - Project Odysseus');
    pdf.text(copyrightText, margin, pageHeight - 10);
    
    // Número da página (direita)
    const pageText = cleanText(`Página ${currentPage} de ${totalPages}`);
    pdf.text(pageText, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };
  
  // Função para adicionar texto com quebra automática
  const addText = (text, options = {}) => {
    const {
      fontSize = 12,
      fontStyle = 'normal',
      color = colors.text,
      indent = 0,
      lineSpacing = 1.2,
      marginBottom = 8,
      maxWidth = contentWidth - indent
    } = options;
    
    if (!text) return;
    
    const cleanedText = cleanText(text);
    if (!cleanedText) return;
    
    // Configurar fonte
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(...color);
    
    // Quebrar texto em linhas
    const lines = pdf.splitTextToSize(cleanedText, maxWidth);
    const lineHeight = fontSize * lineSpacing * 0.352778; // Conversão para mm
    
    // Verificar se precisa de nova página
    const totalHeight = lines.length * lineHeight + marginBottom;
    checkNewPage(totalHeight);
    
    // Adicionar cada linha
    lines.forEach((line, index) => {
      if (index > 0) checkNewPage(lineHeight);
      pdf.text(line, margin + indent, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += marginBottom;
  };
  
  // Função para adicionar seção com estilo
  const addSection = (title, bgColor = colors.background) => {
    checkNewPage(25);
    
    // Fundo da seção
    pdf.setFillColor(...bgColor);
    pdf.roundedRect(margin - 2, yPosition - 8, contentWidth + 4, 20, 2, 2, 'F');
    
    // Título da seção
    addText(title, {
      fontSize: 16,
      fontStyle: 'bold',
      color: colors.primary,
      marginBottom: 12
    });
  };
  
  // Função para adicionar habilidade
  const addSkill = (skill, isLast = false) => {
    // Nome da habilidade
    const skillName = cleanText(skill.name);
    addText(`• ${skillName}`, {
      fontSize: 11,
      fontStyle: 'bold',
      color: colors.secondary,
      indent: 8,
      marginBottom: 3
    });
    
    // URL da documentação (se existir)
    if (skill.url) {
      const skillUrl = cleanText(skill.url);
      addText(`Documentação: ${skillUrl}`, {
        fontSize: 9,
        color: colors.lightText,
        indent: 15,
        marginBottom: isLast ? 8 : 5
      });
    } else if (!isLast) {
      yPosition += 3;
    }
  };
  
  // Iniciar documento
  addHeader();
  
  // Seção do objetivo
  const goalText = cleanText(skillTreeData.goal || 'Objetivo não definido');
  addSection(`Jornada para: ${goalText}`, [240, 253, 244]);
  
  // Adicionar descrição do objetivo
  addText('Este mapa de habilidades foi gerado para guiar seu desenvolvimento profissional de forma estruturada e eficiente.', {
    fontSize: 10,
    color: colors.lightText,
    marginBottom: 15
  });
  
  // Seções de categorias
  if (skillTreeData.categories && Array.isArray(skillTreeData.categories)) {
    skillTreeData.categories.forEach((category, categoryIndex) => {
      if (!category || !category.name) return;
      
      const categoryName = cleanText(category.name);
      addSection(categoryName, [245, 245, 255]);
      
      if (category.skills && Array.isArray(category.skills)) {
        category.skills.forEach((skill, skillIndex) => {
          if (!skill || !skill.name) return;
          const isLastSkill = skillIndex === category.skills.length - 1;
          addSkill(skill, isLastSkill);
        });
      }
      
      // Espaço entre categorias (exceto a última)
      if (categoryIndex < skillTreeData.categories.length - 1) {
        yPosition += 8;
      }
    });
  }
  
  // Adicionar rodapé na última página
  addFooter();
  
  // Adicionar rodapé em todas as páginas anteriores
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i < totalPages; i++) {
    pdf.setPage(i);
    addFooter();
  }
  
  // Salvar arquivo
  const fileName = formatFileName(skillTreeData.goal || 'mapa-habilidades', 'pdf');
  pdf.save(fileName);
};

// Exportar para Excel
export const exportToExcel = (skillTreeData) => {
  const workbook = XLSX.utils.book_new();
  
  // Criar dados para a planilha
  const data = [];
  
  // Cabeçalho
  data.push(['PROJECT ODYSSEUS - Mapa de Habilidades']);
  data.push([`Jornada para: ${skillTreeData.goal}`]);
  data.push(['']); // Linha vazia
  data.push(['Categoria', 'Habilidade', 'Link de Documentação']);
  
  // Dados das habilidades
  skillTreeData.categories?.forEach(category => {
    category.skills?.forEach(skill => {
      data.push([category.name, skill.name, skill.url || 'N/A']);
    });
  });
  
  // Adicionar linha de rodapé
  data.push(['']);
  data.push(['Copyright 2025 © João Lucas de Oliveira - Project Odysseus']);
  
  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Configurar largura das colunas
  worksheet['!cols'] = [
    { width: 30 }, // Categoria
    { width: 50 }, // Habilidade
    { width: 60 }  // Link
  ];
  
  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mapa de Habilidades');
  
  // Salvar
  const fileName = `project-odysseus-${skillTreeData.goal.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Exportar para Word
export const exportToWord = async (skillTreeData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Título principal
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROJECT ODYSSEUS',
                bold: true,
                size: 32,
                color: '4F46E5'
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: 'center'
          }),
          
          // Subtítulo
          new Paragraph({
            children: [
              new TextRun({
                text: 'Mapa de Habilidades Personalizado',
                bold: true,
                size: 24
              })
            ],
            alignment: 'center'
          }),
          
          // Espaço
          new Paragraph({ text: '' }),
          
          // Objetivo
          new Paragraph({
            children: [
              new TextRun({
                text: `Jornada para: ${skillTreeData.goal}`,
                bold: true,
                size: 20,
                color: '059669'
              })
            ],
            heading: HeadingLevel.HEADING_1
          }),
          
          // Espaço
          new Paragraph({ text: '' }),
          
          // Categorias e habilidades
          ...skillTreeData.categories?.flatMap(category => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `📂 ${category.name}`,
                  bold: true,
                  size: 16,
                  color: '7C3AED'
                })
              ],
              heading: HeadingLevel.HEADING_2
            }),
            
            ...category.skills?.map(skill => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `🔗 ${skill.name}`,
                    size: 12
                  }),
                  ...(skill.url ? [
                    new TextRun({
                      text: ` (${skill.url})`,
                      size: 10,
                      color: '6B7280',
                      italics: true
                    })
                  ] : [])
                ]
              })
            ) || [],
            
            // Espaço entre categorias
            new Paragraph({ text: '' })
          ]) || [],
          
          // Rodapé
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Copyright 2025 © João Lucas de Oliveira - Project Odysseus',
                size: 10,
                color: '6B7280',
                italics: true
              })
            ],
            alignment: 'center'
          })
        ]
      }
    ]
  });
  
  // Gerar e salvar
  const blob = await Packer.toBlob(doc);
  const fileName = `project-odysseus-${skillTreeData.goal.replace(/\s+/g, '-').toLowerCase()}.docx`;
  saveAs(blob, fileName);
};

// Função utilitária para formatar nome de arquivo
export const formatFileName = (goal, extension) => {
  if (!goal) {
    return `project-odysseus-mapa-habilidades.${extension}`;
  }
  
  // Limpar e normalizar o texto do objetivo
  const cleanGoal = String(goal)
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiais
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .toLowerCase()
    .substring(0, 50) // Limitar tamanho
    .replace(/^-+|-+$/g, ''); // Remover hífens no início/fim
  
  const finalName = cleanGoal || 'mapa-habilidades';
  return `project-odysseus-${finalName}.${extension}`;
};