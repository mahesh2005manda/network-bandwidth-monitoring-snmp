import io
import pypdf
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def stamp_pdf(input_pdf_path, output_pdf_path):
    print(f"Stamping headers, footers, and page numbers on: {input_pdf_path}")
    writer = pypdf.PdfWriter(clone_from=input_pdf_path)
    total_pages = len(writer.pages)
    print(f"Total Pages Detected: {total_pages}")

    # Dimensions for A4 in points (595.28 x 841.89)
    page_width, page_height = A4
    margin_x = 18 * 72 / 25.4 # 18mm ~ 51 points

    for idx in range(total_pages):
        page_num = idx + 1
        page = writer.pages[idx]

        if page_num == 1:
            # STRICT REQUIREMENT: Front Page must contain ONLY Project Title & 2-column Student table
            # NO header, NO footer, NO page numbers on Cover Page
            continue
        else:
            # Create overlay canvas in memory for Pages 2 to N
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)

            # --- Running Header ---
            can.setFont("Times-Italic", 8.5)
            can.setFillColor(colors.HexColor("#4b5563"))
            can.drawString(margin_x, page_height - 36, "NDM: Automated Network Bandwidth Bottleneck Detection & Alert System Using SNMP v1")
            
            can.setStrokeColor(colors.HexColor("#cbd5e1"))
            can.setLineWidth(0.5)
            can.line(margin_x, page_height - 40, page_width - margin_x, page_height - 40)

            # --- Running Footer ---
            can.setStrokeColor(colors.HexColor("#cbd5e1"))
            can.setLineWidth(0.5)
            can.line(margin_x, 44, page_width - margin_x, 44)

            can.setFont("Times-Roman", 8.5)
            can.setFillColor(colors.HexColor("#4b5563"))
            can.drawString(margin_x, 32, "Network Design and Management | Project Coding Proof")

            page_str = f"Page {page_num} of {total_pages}"
            can.drawRightString(page_width - margin_x, 32, page_str)

            can.save()
            packet.seek(0)

            # Merge overlay onto the cloned writer page
            overlay_reader = pypdf.PdfReader(packet)
            page.merge_page(overlay_reader.pages[0])

    with open(output_pdf_path, "wb") as f_out:
        writer.write(f_out)

    print(f"Successfully generated: {output_pdf_path} ({total_pages} pages)")

if __name__ == "__main__":
    stamp_pdf("raw_document.pdf", "Network_Bandwidth_Monitoring_Coding_Proof.pdf")
