import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("template") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Only .docx files are allowed" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Save the file to storage (filesystem, cloud storage, etc.)
    // 2. Parse the .docx file to extract text content
    // 3. Store template metadata in database

    // For this demo, we'll simulate reading the file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Simulate extracting text content from .docx
    // In reality, you'd use a library like 'mammoth' or 'docx' to parse the file
    const simulatedContent = `
УЧРЕДИТЕЛЕН ДОГОВОР
за създаване на дружество с ограничена отговорност

Днес, {{current_date}}, в {{company_seat}}, ние долуподписаните:

СЪДРУЖНИЦИ:
{{#partners}}
{{partner_index}}. {{partner_name}}, ЕГН {{partner_egn}}, адрес: {{partner_address}}, дял: {{partner_share}} лв.
{{/partners}}

се споразумяхме да учредим дружество с ограничена отговорност със следните характеристики:

ДРУЖЕСТВО:
Наименование: {{company_name}}
Седалище: {{company_seat}}
Адрес на управление: {{company_address}}
Предмет на дейност: {{company_activity}}
Капитал: {{company_capital}} лв.

РАЗПРЕДЕЛЕНИЕ НА ДЯЛОВЕТЕ:
{{#partners}}
{{partner_name}} - {{partner_share}} лв. ({{partner_percentage}}%)
{{/partners}}

Общ капитал: {{company_capital}} лв.

УПРАВЛЕНИЕ:
Дружеството се управлява и представлява от управител, който се избира от общото събрание на съдружниците.

ПОДПИСИ:
{{#partners}}
{{partner_name}}: ________________
{{/partners}}

Дата: {{current_date}}
Място: {{company_seat}}
    `

    // Store the template (in a real app, save to database/filesystem)
    // For demo purposes, we'll just return the content

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      content: simulatedContent,
      message: "Template uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
