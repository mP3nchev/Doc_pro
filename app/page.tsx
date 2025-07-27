import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Download, CheckCircle, Upload } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">DocGen</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/template" className="text-gray-600 hover:text-gray-900">
                Шаблони
              </Link>
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Функции
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                Как работи
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Автоматично генериране на
            <span className="text-blue-600"> учредителни документи</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Създайте учредителни документи за ООД за минути. Въведете данните веднъж и получете готов за редакция .docx
            файл.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link href="/create">
              <Button size="lg" className="px-8 py-4 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Създай документ
              </Button>
            </Link>
            <Link href="/template">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                <Upload className="mr-2 h-5 w-5" />
                Управление на шаблони
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900">Защо DocGen?</h3>
          <p className="mt-4 text-lg text-gray-600">Опростете процеса на създаване на учредителни документи</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <Card>
            <CardHeader>
              <Upload className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Собствени шаблони</CardTitle>
              <CardDescription>Качете свои .docx шаблони с персонализирани полета и форматиране</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Гъвкавост при съдружници</CardTitle>
              <CardDescription>Поддържа от 2 до 5 съдружника с автоматично адаптиране на документите</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Автоматична валидация</CardTitle>
              <CardDescription>Проверка на ЕГН, задължителни полета и съответствие на данните</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Готов за редакция</CardTitle>
              <CardDescription>Изтеглете .docx файл, готов за допълнителни промени и печат</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900">Как работи?</h3>
            <p className="mt-4 text-lg text-gray-600">Четири прости стъпки до готовия документ</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Качете шаблон</h4>
              <p className="text-gray-600">Създайте и качете свой .docx шаблон с маркери</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Въведете данни</h4>
              <p className="text-gray-600">Попълнете информацията за дружеството и съдружниците</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Автоматично попълване</h4>
              <p className="text-gray-600">Системата генерира документите на база въведените данни</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Изтеглете файла</h4>
              <p className="text-gray-600">Получете готов .docx файл за редакция и печат</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-bold">DocGen</span>
            </div>
            <p className="text-gray-400">Автоматично генериране на учредителни документи за ООД</p>
            <p className="text-sm text-gray-500 mt-4">© 2024 DocGen. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
