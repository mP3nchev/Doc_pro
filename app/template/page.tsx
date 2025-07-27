"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, FileText, Eye, Download } from "lucide-react"
import Link from "next/link"

export default function TemplatePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [templateContent, setTemplateContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".docx")) {
      alert("Моля качете .docx файл")
      return
    }

    setIsUploading(true)
    setUploadedFile(file)

    try {
      const formData = new FormData()
      formData.append("template", file)

      const response = await fetch("/api/upload-template", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setTemplateContent(result.content)
        alert("Шаблонът е качен успешно!")
      } else {
        alert("Грешка при качването на шаблона")
      }
    } catch (error) {
      console.error("Error uploading template:", error)
      alert("Грешка при качването на шаблона")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadSampleTemplate = () => {
    // This will now download a known-good, simple DOCX template
    const sampleTemplateUrl = "https://blob.v0.dev/v0-template-simple-docx-example.docx"
    const a = document.createElement("a")
    a.href = sampleTemplateUrl
    a.download = "sample_template.docx" // Download as DOCX
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Управление на шаблони</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Как да създадеш шаблон
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Стъпки за създаване на шаблон:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Създай .docx документ в Microsoft Word</li>
                <li>Напиши текста на документа</li>
                <li>
                  Маркирай полетата с двойни къдрави скоби:{" "}
                  <code className="bg-blue-100 px-1 rounded">{"{{field_name}}"}</code>
                </li>
                <li>
                  За повтарящи се секции използвай:{" "}
                  <code className="bg-blue-100 px-1 rounded">{"{{#partners}} ... {{/partners}}"}</code>
                </li>
                <li>Запази файла като .docx</li>
                <li>Качи го туm</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Полета за дружеството:</h4>
                <ul className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <li>
                    <code>{"{{company_name}}"}</code> - Име
                  </li>
                  <li>
                    <code>{"{{company_name_en}}"}</code> - Име на латиница
                  </li>
                  <li>
                    <code>{"{{company_seat}}"}</code> - Седалище
                  </li>
                  <li>
                    <code>{"{{company_address}}"}</code> - Адрес
                  </li>
                  <li>
                    <code>{"{{company_activity}}"}</code> - Дейност
                  </li>
                  <li>
                    <code>{"{{company_capital}}"}</code> - Капитал
                  </li>
                  <li>
                    <code>{"{{share_count}}"}</code> - Брой дялове
                  </li>
                  <li>
                    <code>{"{{share_value}}"}</code> - Стойност на дял
                  </li>
                  <li>
                    <code>{"{{current_date}}"}</code> - Дата
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Полета за съдружници:</h4>
                <ul className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <li>
                    <code>{"{{#partners}}"}</code> - Начало на цикъл
                  </li>
                  <li>
                    <code>{"{{partner_index}}"}</code> - Номер
                  </li>
                  <li>
                    <code>{"{{partner_name}}"}</code> - Име
                  </li>
                  <li>
                    <code>{"{{partner_egn}}"}</code> - ЕГН
                  </li>
                  <li>
                    <code>{"{{partner_address}}"}</code> - Адрес
                  </li>
                  <li>
                    <code>{"{{partner_share}}"}</code> - Дял
                  </li>
                  <li>
                    <code>{"{{partner_percentage}}"}</code> - %
                  </li>
                  <li>
                    <code>{"{{partner_id_number}}"}</code> - Лична карта
                  </li>
                  <li>
                    <code>{"{{partner_id_issue_date}}"}</code> - Дата издаване
                  </li>
                  <li>
                    <code>{"{{partner_id_issue_place}}"}</code> - Място издаване
                  </li>
                  <li>
                    <code>{"{{/partners}}"}</code> - Край на цикъл
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Полета за управители:</h4>
                <ul className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <li>
                    <code>{"{{#managers}}"}</code> - Начало на цикъл
                  </li>
                  <li>
                    <code>{"{{manager_index}}"}</code> - Номер
                  </li>
                  <li>
                    <code>{"{{manager_name}}"}</code> - Име
                  </li>
                  <li>
                    <code>{"{{manager_egn}}"}</code> - ЕГН
                  </li>
                  <li>
                    <code>{"{{manager_address}}"}</code> - Адрес
                  </li>
                  <li>
                    <code>{"{{manager_id_number}}"}</code> - Лична карта
                  </li>
                  <li>
                    <code>{"{{manager_id_issue_date}}"}</code> - Дата издаване
                  </li>
                  <li>
                    <code>{"{{manager_id_issue_place}}"}</code> - Място издаване
                  </li>
                  <li>
                    <code>{"{{/managers}}"}</code> - Край на цикъл
                  </li>
                  <li>
                    <code>{"{{management_type_text}}"}</code> - Тип управление
                  </li>
                  <li>
                    <code>{"{{lawyer_representative_name}}"}</code> - Упълномощител
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Пример: 3 съдружника, 2 управители</h4>
                <div className="text-sm text-green-800">
                  <p className="mb-2">
                    <strong>Съдружници:</strong>
                  </p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Иван Петров (1 лв.)</li>
                    <li>Мария Георгиева (0.50 лв.)</li>
                    <li>Стоян Николов (0.50 лв.)</li>
                  </ul>
                  <p className="mb-2">
                    <strong>Управители:</strong>
                  </p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Иван Петров (съдружник)</li>
                    <li>Мария Георгиева (съдружник)</li>
                  </ul>
                  <p>
                    <strong>Упълномощител:</strong> Иван Петров
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Пример за управители с декларации:</h4>
              <pre className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded overflow-x-auto">
                {`УПРАВИТЕЛИ:
{{#managers}}
{{manager_index}}. {{manager_name}}, ЕГН {{manager_egn}}, лична карта №{{manager_id_number}}
{{/managers}}

УПЪЛНОМОЩАВАНЕ:
{{lawyer_representative_name}} упълномощава адвоката.

ДЕКЛАРАЦИИ:
{{#managers}}
ДЕКЛАРАЦИЯ №{{manager_index}}
Аз, {{manager_name}}, ЕГН {{manager_egn}}, лична карта №{{manager_id_number}}, ДЕКЛАРИРАМ...
{{/managers}}`}
              </pre>
            </div>

            <div className="flex space-x-4">
              <Button onClick={downloadSampleTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Изтегли примерен шаблон
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Качи шаблон
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-upload">Избери .docx файл *</Label>
              <Input
                id="template-upload"
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>

            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>Качен файл:</strong> {uploadedFile.name}
                </p>
                <p className="text-sm text-green-600">Размер: {(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            {isUploading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Качване на шаблона...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        {templateContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Преглед на шаблона
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{templateContent}</pre>
              </div>
              <div className="mt-4 flex space-x-4">
                <Link href="/create">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Използвай този шаблон
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
