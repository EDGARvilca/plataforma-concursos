package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.RankingRow;
import com.concursos.plataforma.model.Competition;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private static final String[] HEADERS = {"Puesto", "Proyecto", "Participantes", "Categoría", "Evaluaciones", "Promedio %", "Estado"};

    public byte[] rankingXlsx(Competition competition, List<RankingRow> ranking) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Resultados");
            sheet.createRow(0).createCell(0).setCellValue("Resultados - " + competition.getName());
            org.apache.poi.ss.usermodel.Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            Row header = sheet.createRow(2);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIndex = 3;
            for (int i = 0; i < ranking.size(); i++) {
                RankingRow item = ranking.get(i);
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(item.title());
                row.createCell(2).setCellValue(item.participants());
                row.createCell(3).setCellValue(item.category());
                row.createCell(4).setCellValue(item.submittedEvaluations() + " / " + item.assignedJudges());
                row.createCell(5).setCellValue(item.score());
                row.createCell(6).setCellValue(item.status());
            }
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] rankingPdf(Competition competition, List<RankingRow> ranking) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);
        document.open();
        document.add(new Paragraph("Resultados y ranking", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18)));
        document.add(new Paragraph(competition.getName(), FontFactory.getFont(FontFactory.HELVETICA, 12)));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(new float[] {1, 4, 4, 3, 2, 2, 2});
        table.setWidthPercentage(100);
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        for (String name : HEADERS) {
            PdfPCell cell = new PdfPCell(new Phrase(name, headFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }
        for (int i = 0; i < ranking.size(); i++) {
            RankingRow item = ranking.get(i);
            table.addCell(new Phrase(String.valueOf(i + 1), bodyFont));
            table.addCell(new Phrase(item.title(), bodyFont));
            table.addCell(new Phrase(item.participants(), bodyFont));
            table.addCell(new Phrase(item.category(), bodyFont));
            table.addCell(new Phrase(item.submittedEvaluations() + " / " + item.assignedJudges(), bodyFont));
            table.addCell(new Phrase(String.format("%.2f", item.score()), bodyFont));
            table.addCell(new Phrase(item.status(), bodyFont));
        }
        document.add(table);
        document.close();
        return out.toByteArray();
    }
}
