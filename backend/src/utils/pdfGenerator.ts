import PDFDocument from 'pdfkit';
import { Motion } from '../entities/Motion.entity';
import { Signature } from '../entities/Signature.entity';

export class PDFGenerator {
  static async generateMotionPDF(motion: Motion, signatures: Signature[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Mitgliederantrag: ${motion.title}`,
            Author: 'ÖDP-MD²',
            Subject: 'Mitgliederantrag',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Ökologisch-Demokratische Partei (ÖDP)', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(16)
          .text('Mitgliederantrag gemäß §10.1 Satzung', { align: 'center' })
          .moveDown(1);

        // Horizontal line
        doc
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke()
          .moveDown(1);

        // Motion details
        doc.fontSize(14).font('Helvetica-Bold').text('Antragstitel:', { continued: false });
        doc.fontSize(12).font('Helvetica').text(motion.title, { continued: false }).moveDown(0.5);

        doc.fontSize(14).font('Helvetica-Bold').text('Antragstyp:', { continued: false });
        doc.fontSize(12).font('Helvetica').text(motion.type, { continued: false }).moveDown(0.5);

        if (motion.targetParagraph) {
          doc.fontSize(14).font('Helvetica-Bold').text('Betrifft Paragraph:', { continued: false });
          doc
            .fontSize(12)
            .font('Helvetica')
            .text(motion.targetParagraph, { continued: false })
            .moveDown(0.5);
        }

        doc.fontSize(14).font('Helvetica-Bold').text('Antragsteller:', { continued: false });
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(motion.creator.fullName, { continued: false })
          .moveDown(0.5);

        if (motion.trustPerson) {
          doc.fontSize(14).font('Helvetica-Bold').text('Vertrauensperson:', { continued: false });
          doc
            .fontSize(12)
            .font('Helvetica')
            .text(motion.trustPerson.fullName, { continued: false })
            .moveDown(0.5);
        }

        if (motion.backupTrustPerson) {
          doc.fontSize(14).font('Helvetica-Bold').text('Ersatzperson:', { continued: false });
          doc
            .fontSize(12)
            .font('Helvetica')
            .text(motion.backupTrustPerson.fullName, { continued: false })
            .moveDown(0.5);
        }

        doc.fontSize(14).font('Helvetica-Bold').text('Eingereicht am:', { continued: false });
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(motion.submittedAt?.toLocaleDateString('de-DE') || 'N/A', { continued: false })
          .moveDown(1);

        // Antragstext
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Antragstext:', { continued: false })
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .text(motion.fullText, {
            align: 'justify',
            lineGap: 2,
          })
          .moveDown(1);

        // New page for signatures
        doc.addPage();

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('Unterstützende Mitglieder', { align: 'center' })
          .moveDown(1);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(
            `Dieser Antrag wird von ${signatures.length} Mitgliedern unterstützt (Mindestanzahl: 80):`,
            { continued: false }
          )
          .moveDown(1);

        // Signatures table
        const tableTop = doc.y;
        const colWidths = [40, 200, 100, 150];
        const rowHeight = 25;

        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Nr.', 50, tableTop, { width: colWidths[0], continued: false });
        doc.text('Name', 50 + colWidths[0], tableTop, { width: colWidths[1], continued: false });
        doc.text('Mitglieds-Nr.', 50 + colWidths[0] + colWidths[1], tableTop, {
          width: colWidths[2],
          continued: false,
        });
        doc.text('Datum', 50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, {
          width: colWidths[3],
          continued: false,
        });

        // Line under header
        const lineY = tableTop + 15;
        doc
          .moveTo(50, lineY)
          .lineTo(545, lineY)
          .stroke();

        // Signature rows
        doc.fontSize(9).font('Helvetica');
        let currentY = lineY + 10;

        signatures.forEach((sig, index) => {
          if (currentY > 750) {
            doc.addPage();
            currentY = 50;
          }

          doc.text(`${index + 1}`, 50, currentY, { width: colWidths[0], continued: false });
          doc.text(sig.signerName, 50 + colWidths[0], currentY, {
            width: colWidths[1],
            continued: false,
          });
          doc.text(sig.signerMemberId || 'N/A', 50 + colWidths[0] + colWidths[1], currentY, {
            width: colWidths[2],
            continued: false,
          });
          doc.text(
            sig.signedAt.toLocaleDateString('de-DE'),
            50 + colWidths[0] + colWidths[1] + colWidths[2],
            currentY,
            { width: colWidths[3], continued: false }
          );

          currentY += rowHeight;
        });

        // Footer
        doc.addPage();
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            'Dieser Antrag wurde elektronisch über das ÖDP-MD² Portal eingereicht und validiert.',
            { align: 'center' }
          )
          .moveDown(0.5);

        doc
          .fontSize(9)
          .text(
            `Generiert am: ${new Date().toLocaleString('de-DE')} | Referenz: ${motion.id}`,
            { align: 'center' }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
