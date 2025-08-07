import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from 'docx';
import { saveAs } from 'file-saver';

// 📄 Exportar para PDF
export const exportToPDF = async (skillTreeData) => {
  try {
    // Validação inicial dos dados
    if (!skillTreeData) {
      throw new Error('Dados da árvore de habilidades não fornecidos');
    }
    
    if (!skillTreeData.categories || !Array.isArray(skillTreeData.categories)) {
      throw new Error('Categorias não encontradas ou formato inválido');
    }
    
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
  
  // Cores otimizadas para máxima legibilidade e contraste
  const colors = {
    background: [255, 255, 255],     // Fundo branco puro
    primary: [0, 102, 204],          // Azul profissional
    secondary: [40, 167, 69],        // Verde sucesso
    accent: [255, 140, 0],           // Laranja vibrante
    text: [33, 37, 41],              // Texto preto suave
    lightText: [108, 117, 125],      // Texto secundário cinza
    cardBg: [248, 249, 250],         // Fundo dos cards claro
    border: [206, 212, 218],         // Bordas cinza claro
    white: [255, 255, 255],
    purple: [102, 16, 242],          // Roxo profissional
    pink: [214, 51, 132],            // Rosa profissional
    yellow: [255, 193, 7],           // Amarelo alerta
    cyan: [23, 162, 184]             // Ciano profissional
  };
  
  // Função para limpar texto e evitar caracteres problemáticos
  const cleanText = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
      .replace(/[ØßÞþÐð<>]/g, '') // Remove caracteres específicos problemáticos
      .replace(/[^\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u1E00-\u1EFF\u2000-\u206F\u20A0-\u20CF\u2100-\u214F]/g, '') // Mantém apenas caracteres seguros
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\u1E00-\u1EFF.,!?;:()\[\]{}"'-]/g, '') // Filtro final mais restritivo
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim();
  };
  
  // Função para verificar se precisa de nova página
  const checkNewPage = async (requiredSpace = 15) => {
    if (yPosition + requiredSpace > pageHeight - footerHeight - 10) {
      addFooter();
      pdf.addPage();
      await addHeader();
      return true;
    }
    return false;
  };
  
  // Função para adicionar cabeçalho profissional com máximo contraste
  const addHeader = async () => {
    // Fundo branco do cabeçalho
    pdf.setFillColor(...colors.background);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Linha decorativa azul
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, headerHeight - 6, pageWidth, 6, 'F');
    
    // Título principal PROJECT ODYSSEUS centralizado
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    const titleText = cleanText('🌳 PROJECT ODYSSEUS');
    pdf.text(titleText, pageWidth / 2, 28, { align: 'center' });
    
    // Subtítulo em verde
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const subtitleText = 'Mapa de Habilidades Personalizado';
    pdf.text(subtitleText, pageWidth / 2, 45, { align: 'center' });
    
    // Data de geração em texto padrão
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateText = `Gerado em: ${currentDate}`;
    pdf.text(dateText, pageWidth / 2, 58, { align: 'center' });
    
    yPosition = headerHeight + 15;
  };
  
  // Função para adicionar rodapé com máximo contraste
  const addFooter = () => {
    const currentPage = pdf.internal.getCurrentPageInfo().pageNumber;
    const totalPages = pdf.internal.getNumberOfPages();
    
    // Fundo branco do rodapé
    pdf.setFillColor(...colors.background);
    pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
    
    // Linha decorativa azul
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, pageHeight - footerHeight, pageWidth, 3, 'F');
    
    // Copyright em texto padrão
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    const copyrightText = cleanText('🌳 Copyright 2025 João Lucas de Oliveira - Project Odysseus');
    pdf.text(copyrightText, margin, pageHeight - 10);
    
    // Número da página em azul
    pdf.setTextColor(...colors.primary);
    const pageText = cleanText(`📄 Página ${currentPage} de ${totalPages}`);
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
  
  // Função para adicionar seção com estilo e MÁXIMO CONTRASTE
  const addSection = (title, bgColor = [0, 0, 0]) => {
    checkNewPage(30);
    
    // Fundo da seção PRETO
    pdf.setFillColor(0, 0, 0);
    pdf.roundedRect(margin - 3, yPosition - 10, contentWidth + 6, 25, 3, 3, 'F');
    
    // Borda NEON da seção
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin - 3, yPosition - 10, contentWidth + 6, 25, 3, 3, 'S');
    
    // Título da seção BRANCO PURO
    addText(title, {
      fontSize: 18,
      fontStyle: 'bold',
      color: [255, 255, 255],
      marginBottom: 15
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
    
    // Descrição da habilidade (se existir)
    if (skill.description) {
      const skillDescription = cleanText(skill.description);
      addText(skillDescription, {
        fontSize: 9,
        color: colors.text,
        indent: 15,
        marginBottom: 3
      });
    }
    
    // Recursos educacionais com CORES VIBRANTES
    if (skill.resources && Array.isArray(skill.resources) && skill.resources.length > 0) {
      addText('🌳 Recursos Gratuitos:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.yellow,
        indent: 15,
        marginBottom: 4
      });
      
      skill.resources.slice(0, 3).forEach(resource => {
        const typeIcons = {
          'video': '🎥',
          'course': '📖',
          'tutorial': '🌳',
          'book': '📚',
          'article': '📰',
          'tool': '🔧'
        };
        
        const icon = typeIcons[resource.type] || '🔗';
        const resourceTitle = cleanText(resource.title);
        addText(`${icon} ${resourceTitle}`, {
          fontSize: 10,
          fontStyle: 'bold',
          color: [255, 255, 255],
          indent: 20,
          marginBottom: 2
        });
        
        if (resource.url) {
          const resourceUrl = cleanText(resource.url);
          addText(`🔗 ${resourceUrl}`, {
            fontSize: 9,
            color: colors.cyan,
            indent: 25,
            marginBottom: 3
          });
        }
      });
    }
    
    // Seção de documentação removida conforme solicitado

    // Seção de repositórios GitHub removida conforme solicitado

    // 📚 DOCUMENTAÇÃO OFICIAL
    if (skill.documentation && Array.isArray(skill.documentation) && skill.documentation.length > 0) {
      addText('📚 Documentação Oficial:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.primary,
        indent: 15,
        marginBottom: 4
      });
      
      skill.documentation.slice(0, 3).forEach(doc => {
        const docTitle = cleanText(doc.title);
        addText(`📖 ${docTitle}`, {
          fontSize: 10,
          fontStyle: 'bold',
          color: colors.text,
          indent: 20,
          marginBottom: 2
        });
        
        if (doc.url) {
          const docUrl = cleanText(doc.url);
          pdf.setTextColor(...colors.primary);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const linkText = `🔗 Acessar: ${docTitle}`;
          pdf.textWithLink(linkText, margin + 25, yPosition, { url: docUrl });
          yPosition += 5;
        }
        
        if (doc.description) {
          const docDesc = cleanText(doc.description);
          addText(docDesc, {
            fontSize: 9,
            color: colors.lightText,
            indent: 25,
            marginBottom: 3
          });
        }
      });
      
      yPosition += 5;
    }
    
    // 💻 REPOSITÓRIOS E CÓDIGO
    if (skill.repositories && (
      (skill.repositories.github && Array.isArray(skill.repositories.github) && skill.repositories.github.length > 0) ||
      (skill.repositories.huggingface && Array.isArray(skill.repositories.huggingface) && skill.repositories.huggingface.length > 0)
    )) {
      addText('💻 Repositórios e Código:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.secondary,
        indent: 15,
        marginBottom: 4
      });
      
      // GitHub
      if (skill.repositories.github && Array.isArray(skill.repositories.github) && skill.repositories.github.length > 0) {
        addText('🐙 GitHub:', {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.text,
          indent: 20,
          marginBottom: 2
        });
        
        skill.repositories.github.slice(0, 2).forEach(repo => {
          const repoTitle = cleanText(repo.title);
          addText(`⭐ ${repoTitle}`, {
            fontSize: 10,
            fontStyle: 'bold',
            color: colors.text,
            indent: 25,
            marginBottom: 2
          });
          
          if (repo.url) {
            const repoUrl = cleanText(repo.url);
            pdf.setTextColor(...colors.secondary);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const linkText = `🔗 Ver no GitHub: ${repoTitle}`;
            pdf.textWithLink(linkText, margin + 30, yPosition, { url: repoUrl });
            yPosition += 5;
          }
          
          if (repo.description) {
            const repoDesc = cleanText(repo.description);
            addText(repoDesc, {
              fontSize: 9,
              color: colors.lightText,
              indent: 30,
              marginBottom: 3
            });
          }
        });
      }
      
      // Hugging Face
      if (skill.repositories.huggingface && Array.isArray(skill.repositories.huggingface) && skill.repositories.huggingface.length > 0) {
        addText('🤗 Hugging Face:', {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.text,
          indent: 20,
          marginBottom: 2
        });
        
        skill.repositories.huggingface.slice(0, 2).forEach(model => {
          const modelTitle = cleanText(model.title);
          addText(`🤖 ${modelTitle}`, {
            fontSize: 10,
            fontStyle: 'bold',
            color: colors.text,
            indent: 25,
            marginBottom: 2
          });
          
          if (model.url) {
            const modelUrl = cleanText(model.url);
            pdf.setTextColor(...colors.secondary);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const linkText = `🔗 Ver no Hugging Face: ${modelTitle}`;
            pdf.textWithLink(linkText, margin + 30, yPosition, { url: modelUrl });
            yPosition += 5;
          }
        });
      }
      
      yPosition += 5;
    }
    
    // 🎓 CURSOS E CERTIFICAÇÕES
    if (skill.courses && Array.isArray(skill.courses) && skill.courses.length > 0) {
      addText('🎓 Cursos e Certificações:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.accent,
        indent: 15,
        marginBottom: 4
      });
      
      skill.courses.slice(0, 3).forEach(course => {
        const courseTitle = cleanText(course.title);
        const platform = course.platform ? ` (${cleanText(course.platform)})` : '';
        addText(`🎓 ${courseTitle}${platform}`, {
          fontSize: 10,
          fontStyle: 'bold',
          color: colors.text,
          indent: 20,
          marginBottom: 2
        });
        
        if (course.url) {
          const courseUrl = cleanText(course.url);
          pdf.setTextColor(...colors.accent);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const linkText = `🔗 Acessar Curso: ${courseTitle}`;
          pdf.textWithLink(linkText, margin + 25, yPosition, { url: courseUrl });
          yPosition += 5;
        }
        
        if (course.description) {
          const courseDesc = cleanText(course.description);
          addText(courseDesc, {
            fontSize: 9,
            color: colors.lightText,
            indent: 25,
            marginBottom: 3
          });
        }
      });
      
      yPosition += 5;
    }
    
    // 📖 LIVROS E E-BOOKS
    if (skill.books && Array.isArray(skill.books) && skill.books.length > 0) {
      addText('📖 Livros e E-books:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.purple,
        indent: 15,
        marginBottom: 4
      });
      
      skill.books.slice(0, 3).forEach(book => {
        const bookTitle = cleanText(book.title);
        const bookType = book.type === 'digital' ? ' (Digital)' : ' (Físico)';
        addText(`📚 ${bookTitle}${bookType}`, {
          fontSize: 10,
          fontStyle: 'bold',
          color: colors.text,
          indent: 20,
          marginBottom: 2
        });
        
        if (book.url) {
          const bookUrl = cleanText(book.url);
          pdf.setTextColor(...colors.purple);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const linkText = `🔗 Ver Livro: ${bookTitle}`;
          pdf.textWithLink(linkText, margin + 25, yPosition, { url: bookUrl });
          yPosition += 5;
        }
        
        if (book.description) {
          const bookDesc = cleanText(book.description);
          addText(bookDesc, {
            fontSize: 9,
            color: colors.lightText,
            indent: 25,
            marginBottom: 3
          });
        }
      });
      
      yPosition += 5;
    }
    
    // 🎬 CONTEÚDO YOUTUBE ORGANIZADO com CORES VIBRANTES
    if (skill.youtubeContent && (
      (skill.youtubeContent.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) ||
      (skill.youtubeContent.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) ||
      (skill.youtubeContent.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0)
    )) {
      addText('🎬 Conteúdo YouTube Recomendado:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.pink,
        indent: 15,
        marginBottom: 4
      });
      
      // 📚 Playlists Completas (Prioridade)
      if (skill.youtubeContent.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) {
        addText('📚 Playlists Completas:', {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.purple,
          indent: 20,
          marginBottom: 1
        });
        
        skill.youtubeContent.playlists.slice(0, 3).forEach(playlist => {
          const playlistTitle = cleanText(playlist.title);
          const channelName = playlist.channel ? ` - ${cleanText(playlist.channel)}` : '';
          addText(`📚 ${playlistTitle}${channelName}`, {
            fontSize: 10,
            fontStyle: 'bold',
            color: [255, 255, 255],
            indent: 25,
            marginBottom: 2
          });
          
          if (playlist.url) {
            const playlistUrl = cleanText(playlist.url);
            // Criar hiperlink funcional no PDF
            pdf.setTextColor(...colors.purple);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const linkText = `📚 ${playlistTitle} - Assistir Playlist`;
            pdf.textWithLink(linkText, margin + 30, yPosition, { url: playlistUrl });
            yPosition += 5;
          }
          
          if (playlist.description) {
            const playlistDesc = cleanText(playlist.description);
            addText(playlistDesc, {
              fontSize: 9,
              color: colors.lightText,
              indent: 30,
              marginBottom: 3
            });
          }
        });
      }
      
      // 🎥 Vídeos Tutoriais
      if (skill.youtubeContent.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) {
        addText('🎥 Vídeos Tutoriais:', {
          fontSize: 8,
          fontStyle: 'bold',
          color: [16, 185, 129],
          indent: 20,
          marginBottom: 1
        });
        
        skill.youtubeContent.videos.slice(0, 4).forEach(video => {
          const videoTitle = cleanText(video.title);
          const channelName = video.channel ? ` - ${cleanText(video.channel)}` : '';
          addText(`🎥 ${videoTitle}${channelName}`, {
            fontSize: 10,
            fontStyle: 'bold',
            color: [255, 255, 255],
            indent: 25,
            marginBottom: 2
          });
          
          if (video.url) {
            const videoUrl = cleanText(video.url);
            // Criar hiperlink funcional no PDF
            pdf.setTextColor(...colors.pink);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const linkText = `🎥 ${videoTitle} - Assistir Vídeo`;
            pdf.textWithLink(linkText, margin + 30, yPosition, { url: videoUrl });
            yPosition += 5;
          }
        });
      }
      
      // ⚡ YouTube Shorts (Conteúdo Rápido)
      if (skill.youtubeContent.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0) {
        addText('⚡ YouTube Shorts (Dicas Rápidas):', {
          fontSize: 8,
          fontStyle: 'bold',
          color: [245, 101, 101],
          indent: 20,
          marginBottom: 1
        });
        
        skill.youtubeContent.shorts.slice(0, 3).forEach(short => {
          const shortTitle = cleanText(short.title);
          const channelName = short.channel ? ` - ${cleanText(short.channel)}` : '';
          addText(`⚡ ${shortTitle}${channelName}`, {
            fontSize: 10,
            fontStyle: 'bold',
            color: [255, 255, 255],
            indent: 25,
            marginBottom: 2
          });
          
          if (short.url) {
            const shortUrl = cleanText(short.url);
            addText(`🔗 ${shortUrl}`, {
              fontSize: 9,
              color: colors.yellow,
              indent: 30,
              marginBottom: 3
            });
          }
        });
      }
    }

    // 🌐 COMUNIDADES E NETWORKING com CORES VIBRANTES
    if (skill.communities && (
      (skill.communities.study && Array.isArray(skill.communities.study) && skill.communities.study.length > 0) ||
      (skill.communities.networking && Array.isArray(skill.communities.networking) && skill.communities.networking.length > 0) ||
      (skill.communities.forums && Array.isArray(skill.communities.forums) && skill.communities.forums.length > 0)
    )) {
      addText('🌐 Comunidades para Estudo e Networking:', {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.purple,
        indent: 15,
        marginBottom: 4
      });
      
      // Combinar todas as comunidades em um array
      const allCommunities = [
        ...(skill.communities.study || []),
        ...(skill.communities.networking || []),
        ...(skill.communities.forums || [])
      ];
      
      allCommunities.slice(0, 4).forEach(community => {
        const platformIcons = {
          'discord': '💬',
          'reddit': '🔴',
          'telegram': '✈️',
          'slack': '💼',
          'linkedin': '💼',
          'facebook': '📘',
          'github': '🐙',
          'stackoverflow': '📚',
          'forum': '💭',
          'website': '🌐'
        };
        
        const icon = platformIcons[community.platform?.toLowerCase()] || '🌐';
        const communityName = cleanText(community.name || community.title);
        const platformName = community.platform ? ` (${cleanText(community.platform)})` : '';
        
        addText(`${icon} ${communityName}${platformName}`, {
          fontSize: 10,
          fontStyle: 'bold',
          color: [255, 255, 255],
          indent: 20,
          marginBottom: 2
        });
        
        if (community.url) {
          const communityUrl = cleanText(community.url);
          // Criar hiperlink funcional no PDF
          pdf.setTextColor(...colors.purple);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const linkText = `${icon} ${communityName} - Acessar Comunidade`;
          pdf.textWithLink(linkText, margin + 25, yPosition, { url: communityUrl });
          yPosition += 5;
        }
        
        if (community.description) {
          const communityDesc = cleanText(community.description);
          addText(`📝 ${communityDesc}`, {
            fontSize: 9,
            color: colors.lightText,
            indent: 25,
            marginBottom: 4
          });
        }
      });
    }
    
    // URL da documentação (se existir) com HIPERLINK FUNCIONAL
    if (skill.url) {
      const skillUrl = cleanText(skill.url);
      // Criar hiperlink funcional no PDF
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const linkText = `📋 ${skill.name} - Acessar Documentação`;
      pdf.textWithLink(linkText, margin + 15, yPosition, { url: skillUrl });
      yPosition += (isLast ? 10 : 6);
    } else if (!isLast) {
      yPosition += 4;
    }
  };
  
  // Iniciar documento
  await addHeader();
  
  // Seção do objetivo com MÁXIMO CONTRASTE
  const goalText = cleanText(skillTreeData.goal || 'Objetivo não definido');
  addSection(`🌳 Jornada para: ${goalText}`, [0, 0, 0]);
  
  // Adicionar descrição do objetivo
  addText('🌳 Este mapa de habilidades foi gerado para guiar seu desenvolvimento profissional de forma estruturada e eficiente.', {
    fontSize: 12,
    color: colors.text,
    marginBottom: 18
  });
  
  // Seções de categorias
  if (skillTreeData.categories && Array.isArray(skillTreeData.categories)) {
    skillTreeData.categories.forEach((category, categoryIndex) => {
      if (!category || !category.name) return;
      
      const categoryName = cleanText(category.name);
      addSection(`📚 ${categoryName}`, [0, 0, 0]);
      
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
  
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao exportar PDF');
  }
};

// 📊 Exportar para Excel
export const exportToExcel = (skillTreeData) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Criar dados para a planilha principal
    const data = [];
    
    // Cabeçalho principal com tema escuro
    data.push([cleanText('🌳 PROJECT ODYSSEUS - Mapa de Habilidades Completo')]);
    data.push([`🌳 Jornada para: ${cleanText(skillTreeData.goal || 'Objetivo não definido')}`]);
    data.push([`📅 Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`]);
    data.push(['']); // Linha vazia
    
    // Cabeçalhos das colunas com emojis
    data.push([
      '📂 Categoria', 
      '🌳 Habilidade', 
      '📝 Descrição', 
      '🆓 Recursos Gratuitos', 
      '📋 Playlists YouTube', 
      '🎥 Vídeos Tutoriais', 
      '⚡ YouTube Shorts', 
      '👥 Comunidades de Estudo',
      '🤝 Comunidades de Networking'
    ]);
    
    // Dados das habilidades
    skillTreeData.categories?.forEach(category => {
      category.skills?.forEach(skill => {
        // Seção de documentação removida conforme solicitado
        let documentacoes = 'N/A';
        
        // Compilar recursos gratuitos
        let recursos = 'N/A';
        if (skill.resources && skill.resources.length > 0) {
          recursos = skill.resources.slice(0, 3).map(r => 
            `${r.title} (${r.url})`
          ).join('; ');
        }
        
        // Compilar playlists do YouTube
        let playlists = 'N/A';
        if (skill.youtubeContent?.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) {
          playlists = skill.youtubeContent.playlists.slice(0, 2).map(p => 
            `${p.title} (${p.url}) - ${p.description || 'Playlist completa'}`
          ).join('; ');
        }
        
        // Compilar vídeos tutoriais
        let videos = 'N/A';
        if (skill.youtubeContent?.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) {
          videos = skill.youtubeContent.videos.slice(0, 3).map(v => 
            `${v.title} (${v.url}) - ${v.duration || 'N/A'}`
          ).join('; ');
        }
        
        // Compilar YouTube Shorts
        let shorts = 'N/A';
        if (skill.youtubeContent?.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0) {
          shorts = skill.youtubeContent.shorts.slice(0, 3).map(s => 
            `${s.title} (${s.url}) - ${s.description || 'Short educativo'}`
          ).join('; ');
        }
        
        // Compilar comunidades de estudo
        let comunidadesEstudo = 'N/A';
        if (skill.communities?.study && Array.isArray(skill.communities.study) && skill.communities.study.length > 0) {
          comunidadesEstudo = skill.communities.study.slice(0, 2).map(c => 
            `${c.name} (${c.platform}) - ${c.url}`
          ).join('; ');
        }
        
        // Compilar comunidades de networking
        let comunidadesNetwork = 'N/A';
        if (skill.communities?.networking && Array.isArray(skill.communities.networking) && skill.communities.networking.length > 0) {
          comunidadesNetwork = skill.communities.networking.slice(0, 2).map(c => 
            `${c.name} (${c.platform}) - ${c.url}`
          ).join('; ');
        }
        
        data.push([
          category.name,
          skill.name,
          skill.description || 'N/A',
          recursos,
          playlists,
          videos,
          shorts,
          comunidadesEstudo,
          comunidadesNetwork
        ]);
      });
    });
  
    // Adicionar seção de resumo
    data.push(['']);
    data.push(['=== RESUMO DO MAPA ===']);
    data.push(['Total de Categorias:', skillTreeData.categories?.length || 0]);
    data.push(['Total de Habilidades:', skillTreeData.categories?.reduce((total, cat) => total + (cat.skills?.length || 0), 0) || 0]);
    data.push(['']);
    data.push(['Copyright 2025 © João Lucas de Oliveira - Project Odysseus']);
    data.push(['Plataforma: https://project-odysseus.dev']);
  
    // Criar worksheet principal
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Configurar largura das colunas otimizada
    worksheet['!cols'] = [
      { width: 25 }, // Categoria
      { width: 30 }, // Habilidade
      { width: 40 }, // Descrição
      { width: 60 }, // Recursos
      { width: 60 }, // Playlists
      { width: 60 }, // Vídeos
      { width: 60 }, // Shorts
      { width: 60 }, // Comunidades Estudo
      { width: 60 }  // Comunidades Network
    ];
    
    // Aplicar formatação de tema escuro
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!worksheet[cell_address]) continue;
        
        // Aplicar estilo baseado na linha
        if (R === 0) {
          // Cabeçalho principal
          worksheet[cell_address].s = {
            fill: { fgColor: { rgb: "1E1E1E" } }, // Fundo escuro
            font: { color: { rgb: "64B5F6" }, bold: true, sz: 16 }, // Texto azul claro
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R === 4) {
          // Cabeçalhos das colunas
          worksheet[cell_address].s = {
            fill: { fgColor: { rgb: "2D2D2D" } }, // Fundo cinza escuro
            font: { color: { rgb: "9CCC65" }, bold: true, sz: 12 }, // Texto verde claro
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R >= 1 && R <= 3) {
          // Informações do cabeçalho PRETO com texto CIANO
          worksheet[cell_address].s = {
            fill: { fgColor: { rgb: "000000" } }, // Fundo PRETO
            font: { color: { rgb: "00FFFF" }, bold: true, sz: 14 }, // Texto CIANO VIBRANTE
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "FF8C00" } },
              bottom: { style: "thin", color: { rgb: "FF8C00" } },
              left: { style: "thin", color: { rgb: "FF8C00" } },
              right: { style: "thin", color: { rgb: "FF8C00" } }
            }
          };
        } else if (R > 4) {
          // Dados das habilidades com MÁXIMO CONTRASTE
          const isEvenRow = (R - 5) % 2 === 0;
          worksheet[cell_address].s = {
            fill: { fgColor: { rgb: isEvenRow ? "000000" : "1A1A1A" } }, // Alternância PRETO/CINZA ESCURO
            font: { color: { rgb: "FFFFFF" }, sz: 11, bold: false }, // Texto BRANCO PURO
            alignment: { horizontal: "left", vertical: "top", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "666666" } },
              bottom: { style: "thin", color: { rgb: "666666" } },
              left: { style: "thin", color: { rgb: "666666" } },
              right: { style: "thin", color: { rgb: "666666" } }
            }
          };
        }
      }
    }
    
    // Adicionar worksheet principal ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, '🗺️ Mapa Completo');
    
    // Criar planilha separada para Links Organizados
    const linksData = [];
    linksData.push([cleanText('🔗 PROJECT ODYSSEUS - Links Organizados')]);
    linksData.push(['']);
    linksData.push(['🏷️ TIPO', '📋 TÍTULO', '🌐 URL', '📝 DESCRIÇÃO', '📂 CATEGORIA']);
    
    skillTreeData.categories?.forEach(category => {
      category.skills?.forEach(skill => {
        // Seção de documentação removida conforme solicitado
        
        // Adicionar playlists
        if (skill.youtubeContent?.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) {
          skill.youtubeContent.playlists.forEach(playlist => {
            linksData.push([
              '📚 Playlist YouTube',
              playlist.title,
              playlist.url,
              playlist.description || 'Playlist educativa',
              category.name
            ]);
          });
        }
        
        // Adicionar vídeos
        if (skill.youtubeContent?.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) {
          skill.youtubeContent.videos.forEach(video => {
            linksData.push([
              '🎥 Vídeo YouTube',
              video.title,
              video.url,
              `Duração: ${video.duration || 'N/A'}`,
              category.name
            ]);
          });
        }
        
        // Adicionar shorts
        if (skill.youtubeContent?.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0) {
          skill.youtubeContent.shorts.forEach(short => {
            linksData.push([
              '⚡ YouTube Short',
              short.title,
              short.url,
              short.description || 'Conteúdo rápido',
              category.name
            ]);
          });
        }
        
        // Adicionar comunidades
        if (skill.communities?.study && Array.isArray(skill.communities.study) && skill.communities.study.length > 0) {
          skill.communities.study.forEach(community => {
            linksData.push([
              '👥 Comunidade Estudo',
              community.name,
              community.url,
              `Plataforma: ${community.platform}`,
              category.name
            ]);
          });
        }
        
        if (skill.communities?.networking && Array.isArray(skill.communities.networking) && skill.communities.networking.length > 0) {
          skill.communities.networking.forEach(community => {
            linksData.push([
              '🤝 Comunidade Network',
              community.name,
              community.url,
              `Plataforma: ${community.platform}`,
              category.name
            ]);
          });
        }
      });
    });
    
    // Criar worksheet de links com formatação
    const linksWorksheet = XLSX.utils.aoa_to_sheet(linksData);
    linksWorksheet['!cols'] = [
      { width: 25 }, // Tipo
      { width: 40 }, // Título
      { width: 60 }, // URL
      { width: 35 }, // Descrição
      { width: 20 }  // Categoria
    ];
    
    // Aplicar formatação de tema escuro para links
    const linksRange = XLSX.utils.decode_range(linksWorksheet['!ref']);
    
    for (let R = linksRange.s.r; R <= linksRange.e.r; ++R) {
      for (let C = linksRange.s.c; C <= linksRange.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!linksWorksheet[cell_address]) continue;
        
        if (R === 0) {
          // Cabeçalho principal
          linksWorksheet[cell_address].s = {
            fill: { fgColor: { rgb: "1E1E1E" } },
            font: { color: { rgb: "FFB74D" }, bold: true, sz: 16 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R === 2) {
          // Cabeçalhos das colunas
          linksWorksheet[cell_address].s = {
            fill: { fgColor: { rgb: "2D2D2D" } },
            font: { color: { rgb: "81C784" }, bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R > 2) {
          // Dados
          linksWorksheet[cell_address].s = {
            fill: { fgColor: { rgb: "1E1E1E" } },
            font: { color: { rgb: "F5F5F5" }, sz: 10 },
            alignment: { horizontal: "left", vertical: "top", wrapText: true }
          };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, linksWorksheet, '🔗 Links Organizados');
    
    // Criar planilha de resumo estatístico
    const summaryData = [];
    summaryData.push(['📊 RESUMO ESTATÍSTICO DO ROADMAP']);
    summaryData.push(['']);
    summaryData.push(['📈 MÉTRICA', '🔢 VALOR']);
    
    const totalCategories = skillTreeData.categories?.length || 0;
    const totalSkills = skillTreeData.categories?.reduce((total, cat) => total + (cat.skills?.length || 0), 0) || 0;
    const totalResources = skillTreeData.categories?.reduce((total, cat) => {
      return total + (cat.skills?.reduce((skillTotal, skill) => {
        return skillTotal + 
          (skill.resources?.length || 0) +
          ((skill.youtubeContent?.videos && Array.isArray(skill.youtubeContent.videos)) ? skill.youtubeContent.videos.length : 0) +
          ((skill.youtubeContent?.playlists && Array.isArray(skill.youtubeContent.playlists)) ? skill.youtubeContent.playlists.length : 0) +
          ((skill.youtubeContent?.shorts && Array.isArray(skill.youtubeContent.shorts)) ? skill.youtubeContent.shorts.length : 0) +
          ((skill.communities) ? 
            ((skill.communities.study && Array.isArray(skill.communities.study)) ? skill.communities.study.length : 0) +
            ((skill.communities.networking && Array.isArray(skill.communities.networking)) ? skill.communities.networking.length : 0) +
            ((skill.communities.forums && Array.isArray(skill.communities.forums)) ? skill.communities.forums.length : 0)
            : 0);
      }, 0) || 0);
    }, 0);
    
    summaryData.push(['📂 Total de Categorias', totalCategories]);
    summaryData.push(['🌳 Total de Habilidades', totalSkills]);
    summaryData.push(['📚 Total de Recursos', totalResources]);
    summaryData.push(['⏰ Data de Geração', new Date().toLocaleDateString('pt-BR')]);
    summaryData.push(['🕐 Hora de Geração', new Date().toLocaleTimeString('pt-BR')]);
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ width: 30 }, { width: 20 }];
    
    // Aplicar formatação ao resumo
    const summaryRange = XLSX.utils.decode_range(summarySheet['!ref']);
    for (let R = summaryRange.s.r; R <= summaryRange.e.r; ++R) {
      for (let C = summaryRange.s.c; C <= summaryRange.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!summarySheet[cell_address]) continue;
        
        if (R === 0) {
          summarySheet[cell_address].s = {
            fill: { fgColor: { rgb: "1E1E1E" } },
            font: { color: { rgb: "E91E63" }, bold: true, sz: 16 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R === 2) {
          summarySheet[cell_address].s = {
            fill: { fgColor: { rgb: "2D2D2D" } },
            font: { color: { rgb: "FF9800" }, bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (R > 2) {
          summarySheet[cell_address].s = {
            fill: { fgColor: { rgb: "1E1E1E" } },
            font: { color: { rgb: "F5F5F5" }, sz: 11 },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Resumo');
    
    // Salvar arquivo
    const fileName = formatFileName(skillTreeData.goal || 'mapa-habilidades-completo', 'xlsx');
    XLSX.writeFile(workbook, fileName);
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw new Error('Falha ao exportar Excel');
  }
};

// 📝 Exportar para Word
export const exportToWord = async (skillTreeData) => {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              backgroundColor: '1E1E1E' // Fundo escuro para a página
            }
          },
          children: [
            // Título principal com tema escuro
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText('🌳 PROJECT ODYSSEUS'),
                  bold: true,
                  size: 36,
                  color: '64B5F6'
                })
              ],
              heading: HeadingLevel.TITLE,
              alignment: 'center',
              spacing: { after: 400 }
            }),
            
            // Subtítulo
            new Paragraph({
              children: [
                new TextRun({
                  text: '🗺️ Mapa de Habilidades Personalizado',
                  bold: true,
                  size: 26,
                  color: '9CCC65'
                })
              ],
              alignment: 'center',
              spacing: { after: 300 }
            }),
            
            // Espaço
            new Paragraph({ text: '' }),
            
            // Objetivo
            new Paragraph({
              children: [
                new TextRun({
                  text: `🌳 Jornada para: ${cleanText(skillTreeData.goal || 'Objetivo não definido')}`,
                  bold: true,
                  size: 22,
                  color: 'FFB74D'
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 300 }
            }),
            
            // Data de geração
            new Paragraph({
              children: [
                new TextRun({
                  text: `📅 Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
                  size: 14,
                  color: 'BDBDBD',
                  italics: true
                })
              ],
              alignment: 'center',
              spacing: { after: 600 }
            }),
            
            // Espaço
            new Paragraph({ text: '' }),
            
            // Categorias e habilidades
            ...skillTreeData.categories?.flatMap((category, categoryIndex) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `📂 ${categoryIndex + 1}. ${category.name}`,
                    bold: true,
                    size: 22,
                    color: 'AB47BC'
                  })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              }),
              
              ...category.skills?.flatMap((skill, skillIndex) => {
                const skillParagraphs = [];
                
                // Nome da habilidade
                skillParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `🌳 ${categoryIndex + 1}.${skillIndex + 1} ${skill.name}`,
                        bold: true,
                        size: 18,
                        color: '4FC3F7'
                      })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 100 }
                  })
                );
                
                // Descrição
                if (skill.description) {
                  skillParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: skill.description,
                          size: 14,
                          color: 'E0E0E0'
                        })
                      ],
                      spacing: { after: 200 }
                    })
                  );
                }
                
                // Seção de documentação removida conforme solicitado
                
                // Recursos educacionais
                if (skill.resources && skill.resources.length > 0) {
                  skillParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '📚 Recursos Gratuitos:',
                          bold: true,
                          size: 14,
                          color: 'FFB74D'
                        })
                      ],
                      spacing: { before: 200, after: 100 }
                    })
                  );
                  
                  skill.resources.slice(0, 3).forEach(resource => {
                    const typeIcons = {
                      'video': '🎥',
                      'course': '📖',
                      'tutorial': '🌳',
                      'book': '📚',
                      'article': '📰',
                      'tool': '🔧'
                    };
                    
                    const icon = typeIcons[resource.type] || '🔗';
                    
                    skillParagraphs.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${icon} `,
                            size: 12,
                            color: 'F5F5F5'
                          }),
                          ...(resource.url ? [
                            new ExternalHyperlink({
                              children: [
                                new TextRun({
                                  text: resource.title,
                                  size: 12,
                                  color: '64B5F6',
                                  bold: true,
                                  underline: {}
                                })
                              ],
                              link: resource.url
                            })
                          ] : [
                            new TextRun({
                              text: resource.title,
                              size: 12,
                              color: 'F5F5F5'
                            })
                          ])
                        ],
                        spacing: { after: 100 }
                      })
                    );
                  });
                }
                
                // Conteúdo do YouTube
                if (skill.youtubeContent && (
                  (skill.youtubeContent.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) ||
                  (skill.youtubeContent.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) ||
                  (skill.youtubeContent.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0)
                )) {
                  skillParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '🎬 Conteúdo YouTube Recomendado:',
                          bold: true,
                          size: 14,
                          color: 'E91E63'
                        })
                      ],
                      spacing: { before: 200, after: 100 }
                    })
                  );
                  
                  // Playlists (Prioridade)
                  if (skill.youtubeContent.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0) {
                    skillParagraphs.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '📚 Playlists Completas:',
                            bold: true,
                            size: 12,
                            color: 'AB47BC'
                          })
                        ],
                        spacing: { after: 50 }
                      })
                    );
                    
                    skill.youtubeContent.playlists.slice(0, 2).forEach(playlist => {
                      skillParagraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `📚 `,
                              size: 11,
                              color: 'F5F5F5',
                              bold: true
                            }),
                            ...(playlist.url ? [
                              new ExternalHyperlink({
                                children: [
                                  new TextRun({
                                    text: playlist.title,
                                    size: 11,
                                    color: '00FFFF',
                                    bold: true,
                                    underline: {}
                                  })
                                ],
                                link: playlist.url
                              })
                            ] : [
                              new TextRun({
                                text: playlist.title,
                                size: 11,
                                color: 'F5F5F5',
                                bold: true
                              })
                            ]),
                            ...(playlist.channel ? [
                              new TextRun({
                              text: ` - ${playlist.channel}`,
                              size: 12,
                              color: 'FFFFFF',
                              bold: true
                            })
                            ] : [])
                          ],
                          spacing: { after: 100 }
                        })
                      );
                    });
                  }
                  
                  // Vídeos Tutoriais
                  if (skill.youtubeContent.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0) {
                    skillParagraphs.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '🎥 Vídeos Tutoriais:',
                            bold: true,
                            size: 14,
                            color: 'FF6496'
                          })
                        ],
                        spacing: { after: 50 }
                      })
                    );
                    
                    skill.youtubeContent.videos.slice(0, 3).forEach(video => {
                      skillParagraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `🎥 ${video.title}`,
                              size: 12,
                              color: 'FFFFFF',
                              bold: true
                            }),
                            ...(video.channel ? [
                              new TextRun({
                              text: ` - ${video.channel}`,
                              size: 12,
                              color: 'FFFFFF',
                              bold: true
                            })
                            ] : []),
                            ...(video.url ? [
                              new TextRun({
                              text: `\n  🔗 ${video.url}`,
                              size: 11,
                              color: 'FF6496',
                              bold: true
                            })
                            ] : [])
                          ],
                          spacing: { after: 100 }
                        })
                      );
                    });
                  }
                  
                  // YouTube Shorts
                  if (skill.youtubeContent.shorts && Array.isArray(skill.youtubeContent.shorts) && skill.youtubeContent.shorts.length > 0) {
                    skillParagraphs.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '⚡ YouTube Shorts (Dicas Rápidas):',
                            bold: true,
                            size: 14,
                            color: 'FFFF00'
                          })
                        ],
                        spacing: { after: 50 }
                      })
                    );
                    
                    skill.youtubeContent.shorts.slice(0, 2).forEach(short => {
                      skillParagraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `⚡ ${short.title}`,
                              size: 12,
                              color: 'FFFFFF',
                              bold: true
                            }),
                            ...(short.channel ? [
                              new TextRun({
                              text: ` - ${short.channel}`,
                              size: 12,
                              color: 'FFFFFF',
                              bold: true
                            })
                            ] : []),
                            ...(short.url ? [
                              new TextRun({
                              text: `\n  🔗 ${short.url}`,
                              size: 11,
                              color: 'FFFF00',
                              bold: true
                            })
                            ] : [])
                          ],
                          spacing: { after: 100 }
                        })
                      );
                    });
                  }
                }
                
                // Comunidades
                if (skill.communities && (
                  (skill.communities.study && Array.isArray(skill.communities.study) && skill.communities.study.length > 0) ||
                  (skill.communities.networking && Array.isArray(skill.communities.networking) && skill.communities.networking.length > 0) ||
                  (skill.communities.forums && Array.isArray(skill.communities.forums) && skill.communities.forums.length > 0)
                )) {
                  skillParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '🌐 Comunidades para Estudo e Networking:',
                          bold: true,
                          size: 16,
                          color: '00FF00'
                        })
                      ],
                      spacing: { before: 200, after: 100 }
                    })
                  );
                  
                  // Combinar todas as comunidades em um array
                  const allCommunities = [
                    ...(skill.communities.study || []),
                    ...(skill.communities.networking || []),
                    ...(skill.communities.forums || [])
                  ];
                  
                  allCommunities.slice(0, 3).forEach(community => {
                    const platformIcons = {
                      'discord': '💬',
                      'reddit': '🔴',
                      'telegram': '✈️',
                      'slack': '💼',
                      'linkedin': '💼',
                      'facebook': '📘',
                      'github': '🐙',
                      'stackoverflow': '📚',
                      'forum': '💭',
                      'website': '🌐'
                    };
                    
                    const icon = platformIcons[community.platform?.toLowerCase()] || '🌐';
                    
                    skillParagraphs.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${icon} ${community.name || community.title}`,
                            size: 12,
                            color: 'FFFFFF',
                            bold: true
                          }),
                          ...(community.platform ? [
                            new TextRun({
                              text: ` (${community.platform})`,
                              size: 11,
                              color: 'FFFFFF',
                              bold: true
                            })
                          ] : []),
                          ...(community.url ? [
                            new TextRun({
                              text: `\n  🔗 ${community.url}`,
                              size: 11,
                              color: '00FF00',
                              bold: true
                            })
                          ] : []),
                          ...(community.description ? [
                            new TextRun({
                              text: `\n  📝 ${community.description}`,
                              size: 11,
                              color: 'FFFFFF',
                              bold: true
                            })
                          ] : [])
                        ],
                        spacing: { after: 100 }
                      })
                    );
                  });
                }
                
                // URL da documentação (legacy)
                if (skill.url) {
                  skillParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `📋 Documentação: ${skill.url}`,
                          size: 12,
                          color: 'FF6496',
                          bold: true
                        })
                      ],
                      spacing: { after: 100 }
                    })
                  );
                }
                
                // Espaço entre habilidades
                skillParagraphs.push(new Paragraph({ text: '' }));
                
                return skillParagraphs;
              }) || [],
              
              // Espaço entre categorias
              new Paragraph({ text: '' })
            ]) || [],
          
          // Rodapé
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText('© 2025 João Lucas de Oliveira - Project Odysseus | https://project-odysseus.dev'),
                size: 12,
                color: 'FFFFFF',
                bold: true
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
  const fileName = formatFileName(skillTreeData.goal || 'mapa-habilidades', 'docx');
  saveAs(blob, fileName);
  
  } catch (error) {
    console.error('Erro ao exportar Word:', error);
    throw new Error('Falha ao exportar Word');
  }
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