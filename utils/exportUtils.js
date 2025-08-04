import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Exportar para PDF
export const exportToPDF = (skillTreeData) => {
  const pdf = new jsPDF();
  
  // Configurações melhoradas
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  
  // Cores personalizadas
  const colors = {
    primary: [79, 70, 229],     // Indigo
    secondary: [5, 150, 105],   // Emerald
    accent: [124, 58, 237],     // Violet
    text: [31, 41, 55],         // Gray-800
    lightText: [107, 114, 128], // Gray-500
    background: [249, 250, 251] // Gray-50
  };
  
  // Função para verificar nova página
  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin - 30) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  // Função para adicionar cabeçalho decorativo
  const addHeader = () => {
    // Fundo do cabeçalho
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Título principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJECT ODYSSEUS', pageWidth / 2, 25, { align: 'center' });
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Mapa de Habilidades Personalizado', pageWidth / 2, 40, { align: 'center' });
    
    yPosition = 80;
  };
  
  // Função para adicionar texto estilizado
  const addStyledText = (text, options = {}) => {
    const {
      fontSize = 12,
      isBold = false,
      color = colors.text,
      indent = 0,
      spacing = 8,
      maxWidth = contentWidth - indent
    } = options;
    
    checkNewPage(fontSize + spacing);
    
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(...color);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach(line => {
      checkNewPage();
      pdf.text(line, margin + indent, yPosition);
      yPosition += fontSize * 0.6;
    });
    
    yPosition += spacing;
  };
  
  // Função para adicionar seção com fundo
  const addSection = (title, content, bgColor = colors.background) => {
    checkNewPage(40);
    
    // Fundo da seção
    pdf.setFillColor(...bgColor);
    pdf.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 25, 3, 3, 'F');
    
    // Título da seção
    addStyledText(title, {
      fontSize: 16,
      isBold: true,
      color: colors.primary,
      spacing: 15
    });
    
    // Conteúdo
    if (typeof content === 'function') {
      content();
    } else {
      addStyledText(content, { spacing: 20 });
    }
  };
  
  // Adicionar cabeçalho
  addHeader();
  
  // Seção do objetivo
  addSection(`🎯 Jornada para: ${skillTreeData.goal}`, '', [240, 253, 244]);
  
  // Seção de categorias
  skillTreeData.categories?.forEach((category) => {
    addSection(`📂 ${category.name}`, () => {
      category.skills?.forEach((skill) => {
        // Nome da habilidade
        addStyledText(`• ${skill.name}`, {
          fontSize: 11,
          isBold: true,
          color: colors.secondary,
          indent: 10,
          spacing: 4
        });
        
        // URL da documentação
        if (skill.url) {
          addStyledText(`📖 ${skill.url}`, {
            fontSize: 9,
            color: colors.lightText,
            indent: 20,
            spacing: 8
          });
        }
      });
    }, [245, 245, 255]);
  });
  
  // Adicionar rodapé profissional em todas as páginas
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Linha decorativa
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    
    // Copyright
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.lightText);
    pdf.text(
      'Copyright 2025 © João Lucas de Oliveira - Project Odysseus',
      margin,
      pageHeight - 15
    );
    
    // Número da página
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 15,
      { align: 'right' }
    );
    
    // Data de geração
    const currentDate = new Date().toLocaleDateString('pt-BR');
    pdf.text(
      `Gerado em: ${currentDate}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }
  
  // Salvar com nome melhorado
  const fileName = formatFileName(skillTreeData.goal, 'pdf');
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
  const cleanGoal = goal.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  return `project-odysseus-${cleanGoal}.${extension}`;
};