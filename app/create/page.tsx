"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Users, Building, FileText, Download, UserCheck, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Partner {
  name: string
  egn: string
  address: string
  share: string
  idNumber: string
  idIssueDate: string
  idIssuePlace: string
}

interface Manager {
  type: "partner" | "external"
  partnerIndex?: number
  name: string
  egn: string
  address: string
  idNumber: string
  idIssueDate: string
  idIssuePlace: string
}

interface CompanyData {
  name: string
  nameEn: string
  seat: string
  address: string
  activity: string
  capital: string
  shareCount: string
  shareValue: string
  partnerCount: number
  partners: Partner[]
  managers: Manager[]
  managementType: "joint" | "separate"
  lawyerRepresentative?: number // index of manager who represents the lawyer
}

export default function CreateDocumentPage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    nameEn: "",
    seat: "",
    address: "",
    activity: "",
    capital: "",
    shareCount: "",
    shareValue: "",
    partnerCount: 2,
    partners: [
      { name: "", egn: "", address: "", share: "", idNumber: "", idIssueDate: "", idIssuePlace: "" },
      { name: "", egn: "", address: "", share: "", idNumber: "", idIssueDate: "", idIssuePlace: "" },
    ],
    managers: [
      {
        type: "partner",
        partnerIndex: 0,
        name: "",
        egn: "",
        address: "",
        idNumber: "",
        idIssueDate: "",
        idIssuePlace: "",
      },
    ],
    managementType: "joint",
    lawyerRepresentative: 0,
  })

  const validateEGN = (egn: string): boolean => {
    return /^\d{10}$/.test(egn)
  }

  const validateCapital = (): { isValid: boolean; message: string } => {
    const totalCapital = Number.parseFloat(companyData.capital) || 0
    const totalShares = companyData.partners.reduce((sum, partner) => {
      return sum + (Number.parseFloat(partner.share) || 0)
    }, 0)

    if (Math.abs(totalCapital - totalShares) > 0.01) {
      return {
        isValid: false,
        message: `Капиталът (${totalCapital} лв.) не съвпада със сумата от дяловете (${totalShares} лв.)`,
      }
    }

    return { isValid: true, message: "" }
  }

  const validateShareCalculation = (): { isValid: boolean; message: string } => {
    const shareCount = Number.parseFloat(companyData.shareCount) || 0
    const shareValue = Number.parseFloat(companyData.shareValue) || 0
    const capital = Number.parseFloat(companyData.capital) || 0
    const calculatedCapital = shareCount * shareValue

    if (Math.abs(capital - calculatedCapital) > 0.01) {
      return {
        isValid: false,
        message: `Капиталът (${capital} лв.) не съвпада с изчислението: ${shareCount} дяла × ${shareValue} лв. = ${calculatedCapital} лв.`,
      }
    }

    return { isValid: true, message: "" }
  }

  const updatePartnerCount = (count: number) => {
    const newPartners = [...companyData.partners]

    if (count > newPartners.length) {
      for (let i = newPartners.length; i < count; i++) {
        newPartners.push({ name: "", egn: "", address: "", share: "", idNumber: "", idIssueDate: "", idIssuePlace: "" })
      }
    } else if (count < newPartners.length) {
      newPartners.splice(count)
    }

    // Update managers that reference partners
    const updatedManagers = companyData.managers.map((manager) => {
      if (manager.type === "partner" && manager.partnerIndex !== undefined && manager.partnerIndex >= count) {
        return { ...manager, partnerIndex: 0 }
      }
      return manager
    })

    setCompanyData({
      ...companyData,
      partnerCount: count,
      partners: newPartners,
      managers: updatedManagers,
    })
  }

  const updatePartner = (index: number, field: keyof Partner, value: string) => {
    const newPartners = [...companyData.partners]
    newPartners[index] = { ...newPartners[index], [field]: value }

    // Update managers that reference this partner
    const updatedManagers = companyData.managers.map((manager) => {
      if (manager.type === "partner" && manager.partnerIndex === index) {
        return {
          ...manager,
          name: field === "name" ? value : newPartners[index].name,
          egn: field === "egn" ? value : newPartners[index].egn,
          address: field === "address" ? value : newPartners[index].address,
          idNumber: field === "idNumber" ? value : newPartners[index].idNumber,
          idIssueDate: field === "idIssueDate" ? value : newPartners[index].idIssueDate,
          idIssuePlace: field === "idIssuePlace" ? value : newPartners[index].idIssuePlace,
        }
      }
      return manager
    })

    setCompanyData({ ...companyData, partners: newPartners, managers: updatedManagers })
  }

  const addManager = () => {
    const defaultPartnerIndex = 0
    const defaultPartner = companyData.partners[defaultPartnerIndex]

    const newManager: Manager = {
      type: "partner",
      partnerIndex: defaultPartnerIndex,
      name: defaultPartner?.name || "",
      egn: defaultPartner?.egn || "",
      address: defaultPartner?.address || "",
      idNumber: defaultPartner?.idNumber || "",
      idIssueDate: defaultPartner?.idIssueDate || "",
      idIssuePlace: defaultPartner?.idIssuePlace || "",
    }

    setCompanyData({
      ...companyData,
      managers: [...companyData.managers, newManager],
    })
  }

  const removeManager = (index: number) => {
    const newManagers = companyData.managers.filter((_, i) => i !== index)
    // Update lawyer representative if needed
    let newLawyerRep = companyData.lawyerRepresentative
    if (newLawyerRep === index) {
      newLawyerRep = 0
    } else if (newLawyerRep !== undefined && newLawyerRep > index) {
      newLawyerRep = newLawyerRep - 1
    }

    setCompanyData({
      ...companyData,
      managers: newManagers,
      lawyerRepresentative: newLawyerRep,
    })
  }

  const updateManager = (index: number, field: string, value: string | number) => {
    const newManagers = [...companyData.managers]
    const manager = { ...newManagers[index] }

    if (field === "type") {
      manager.type = value as "partner" | "external"
      if (value === "partner") {
        manager.partnerIndex = 0
        const partner = companyData.partners[0]
        manager.name = partner?.name || ""
        manager.egn = partner?.egn || ""
        manager.address = partner?.address || ""
        manager.idNumber = partner?.idNumber || ""
        manager.idIssueDate = partner?.idIssueDate || ""
        manager.idIssuePlace = partner?.idIssuePlace || ""
      } else {
        manager.partnerIndex = undefined
        manager.name = ""
        manager.egn = ""
        manager.address = ""
        manager.idNumber = ""
        manager.idIssueDate = ""
        manager.idIssuePlace = ""
      }
    } else if (field === "partnerIndex") {
      manager.partnerIndex = value as number
      const partner = companyData.partners[value as number]
      manager.name = partner?.name || ""
      manager.egn = partner?.egn || ""
      manager.address = partner?.address || ""
      manager.idNumber = partner?.idNumber || ""
      manager.idIssueDate = partner?.idIssueDate || ""
      manager.idIssuePlace = partner?.idIssuePlace || ""
    } else {
      ;(manager as any)[field] = value
    }

    newManagers[index] = manager
    setCompanyData({ ...companyData, managers: newManagers })
  }

  const validateStep1 = () => {
    const shareValidation = validateShareCalculation()
    return (
      companyData.name &&
      companyData.nameEn &&
      companyData.seat &&
      companyData.address &&
      companyData.activity &&
      companyData.capital &&
      companyData.shareCount &&
      companyData.shareValue &&
      shareValidation.isValid
    )
  }

  const validateStep2 = () => {
    const basicValidation = companyData.partners.every(
      (partner) =>
        partner.name &&
        partner.egn &&
        partner.address &&
        partner.share &&
        partner.idNumber &&
        partner.idIssueDate &&
        partner.idIssuePlace &&
        validateEGN(partner.egn),
    )
    const capitalValidation = validateCapital()
    return basicValidation && capitalValidation.isValid
  }

  const validateStep3 = () => {
    const managersValid = companyData.managers.every((manager) => {
      // Check common required fields for all managers
      if (
        !manager.name ||
        !manager.egn ||
        !manager.address ||
        !manager.idNumber ||
        !manager.idIssueDate ||
        !manager.idIssuePlace
      ) {
        return false
      }
      // Validate EGN for all managers
      if (!validateEGN(manager.egn)) {
        return false
      }

      // If manager is a partner, ensure the partnerIndex is valid
      if (manager.type === "partner") {
        if (
          manager.partnerIndex === undefined ||
          manager.partnerIndex < 0 ||
          manager.partnerIndex >= companyData.partners.length
        ) {
          return false
        }
        // The fields (name, egn, etc.) for partner-type managers are expected to be populated
        // by the updateManager and addManager functions from the corresponding partner's data.
        // The checks above (manager.name, manager.egn, etc.) already cover this.
      }
      return true
    })

    // Don't require lawyer representative to be valid for form submission
    return managersValid
  }

  const generateDocument = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `${companyData.name}_учредителни_документи.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        setStep(4)
      } else {
        const errorData = await response.json()
        alert(`Възникна грешка при генерирането на документа: ${errorData.error || "Неизвестна грешка"}`)
      }
    } catch (error) {
      console.error("Error generating document:", error)
      alert("Възникна грешка при генерирането на документа. Моля опитайте отново.")
    } finally {
      setIsGenerating(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Създаване на документ</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <Building className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Дружество</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <Users className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Съдружници</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Управители</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 4 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${step >= 4 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <FileText className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Генериране</span>
            </div>
          </div>
        </div>

        {/* Step 1: Company Data */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Данни за дружеството
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Наименование на дружеството *</Label>
                  <Input
                    id="company-name"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    placeholder="напр. ТЕСТ ООД"
                  />
                </div>
                <div>
                  <Label htmlFor="company-name-en">Наименование на латиница *</Label>
                  <Input
                    id="company-name-en"
                    value={companyData.nameEn}
                    onChange={(e) => setCompanyData({ ...companyData, nameEn: e.target.value })}
                    placeholder="напр. TEST OOD"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-seat">Седалище *</Label>
                  <Input
                    id="company-seat"
                    value={companyData.seat}
                    onChange={(e) => setCompanyData({ ...companyData, seat: e.target.value })}
                    placeholder="напр. София"
                  />
                </div>
                <div>
                  <Label htmlFor="partner-count">Брой съдружници *</Label>
                  <Select
                    value={companyData.partnerCount.toString()}
                    onValueChange={(value) => updatePartnerCount(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 съдружника</SelectItem>
                      <SelectItem value="3">3 съдружника</SelectItem>
                      <SelectItem value="4">4 съдружника</SelectItem>
                      <SelectItem value="5">5 съдружника</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="company-address">Адрес на управление *</Label>
                <Input
                  id="company-address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="напр. гр. София, ул. Витоша 1"
                />
              </div>

              <div>
                <Label htmlFor="company-activity">Предмет на дейност *</Label>
                <Textarea
                  id="company-activity"
                  value={companyData.activity}
                  onChange={(e) => setCompanyData({ ...companyData, activity: e.target.value })}
                  placeholder="Опишете основната дейност на дружеството"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="company-capital">Капитал (лв.) *</Label>
                  <Input
                    id="company-capital"
                    type="number"
                    value={companyData.capital}
                    onChange={(e) => setCompanyData({ ...companyData, capital: e.target.value })}
                    placeholder="напр. 2"
                    min="2"
                  />
                </div>
                <div>
                  <Label htmlFor="share-count">Брой дялове *</Label>
                  <Input
                    id="share-count"
                    type="number"
                    value={companyData.shareCount}
                    onChange={(e) => setCompanyData({ ...companyData, shareCount: e.target.value })}
                    placeholder="напр. 2"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="share-value">Стойност на дял (лв.) *</Label>
                  <Input
                    id="share-value"
                    type="number"
                    value={companyData.shareValue}
                    onChange={(e) => setCompanyData({ ...companyData, shareValue: e.target.value })}
                    placeholder="напр. 1"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              {(() => {
                const shareValidation = validateShareCalculation()
                return (
                  !shareValidation.isValid &&
                  companyData.capital &&
                  companyData.shareCount &&
                  companyData.shareValue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center text-red-800">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span className="font-medium">{shareValidation.message}</span>
                      </div>
                    </div>
                  )
                )
              })()}

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!validateStep1()}>
                  Напред
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Partners Data */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Данни за съдружниците
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {(() => {
                const capitalValidation = validateCapital()
                return (
                  <>
                    {companyData.partners.map((partner, index) => (
                      <div key={index} className="border rounded-lg p-6 bg-gray-50">
                        <h3 className="text-lg font-semibold mb-4">Съдружник {index + 1}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`partner-${index}-name`}>Име и фамилия *</Label>
                            <Input
                              id={`partner-${index}-name`}
                              value={partner.name}
                              onChange={(e) => updatePartner(index, "name", e.target.value)}
                              placeholder="напр. Иван Петров"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`partner-${index}-egn`}>ЕГН *</Label>
                            <Input
                              id={`partner-${index}-egn`}
                              value={partner.egn}
                              onChange={(e) => updatePartner(index, "egn", e.target.value)}
                              placeholder="10 цифри"
                              maxLength={10}
                            />
                            {partner.egn && !validateEGN(partner.egn) && (
                              <p className="text-sm text-red-600 mt-1">ЕГН трябва да съдържа точно 10 цифри</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`partner-${index}-address`}>Адрес *</Label>
                            <Input
                              id={`partner-${index}-address`}
                              value={partner.address}
                              onChange={(e) => updatePartner(index, "address", e.target.value)}
                              placeholder="напр. гр. София, ул. Витоша 1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`partner-${index}-share`}>Дял (лв.) *</Label>
                            <Input
                              id={`partner-${index}-share`}
                              type="number"
                              value={partner.share}
                              onChange={(e) => updatePartner(index, "share", e.target.value)}
                              placeholder="напр. 1"
                              min="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`partner-${index}-id`}>Номер на лична карта *</Label>
                            <Input
                              id={`partner-${index}-id`}
                              value={partner.idNumber}
                              onChange={(e) => updatePartner(index, "idNumber", e.target.value)}
                              placeholder="напр. 123456789"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`partner-${index}-id-date`}>Дата на издаване *</Label>
                            <Input
                              id={`partner-${index}-id-date`}
                              type="date"
                              value={partner.idIssueDate}
                              onChange={(e) => updatePartner(index, "idIssueDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`partner-${index}-id-place`}>Място на издаване *</Label>
                            <Input
                              id={`partner-${index}-id-place`}
                              value={partner.idIssuePlace}
                              onChange={(e) => updatePartner(index, "idIssuePlace", e.target.value)}
                              placeholder="напр. МВР София"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {!capitalValidation.isValid && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center text-red-800">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <span className="font-medium">{capitalValidation.message}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Назад
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!validateStep2()}>
                        Напред
                      </Button>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Managers Data */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Данни за управителите
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Label className="text-base font-medium">Начин на управление *</Label>
                <RadioGroup
                  value={companyData.managementType}
                  onValueChange={(value: "joint" | "separate") =>
                    setCompanyData({ ...companyData, managementType: value })
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="joint" id="joint" />
                    <Label htmlFor="joint">Заедно (всички управители подписват заедно)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="separate" id="separate" />
                    <Label htmlFor="separate">Поотделно (всеки управител може да подписва самостоятелно)</Label>
                  </div>
                </RadioGroup>
              </div>

              {companyData.managers.map((manager, index) => (
                <div key={index} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Управител {index + 1}</h3>
                    {companyData.managers.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeManager(index)}>
                        Премахни
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Тип управител *</Label>
                      <RadioGroup
                        value={manager.type}
                        onValueChange={(value) => updateManager(index, "type", value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="partner" id={`partner-${index}`} />
                          <Label htmlFor={`partner-${index}`}>Съдружник</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="external" id={`external-${index}`} />
                          <Label htmlFor={`external-${index}`}>Външно лице</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {manager.type === "partner" ? (
                      <div>
                        <Label>Избери съдружник *</Label>
                        <Select
                          value={manager.partnerIndex?.toString() || "0"}
                          onValueChange={(value) => updateManager(index, "partnerIndex", Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {companyData.partners.map((partner, partnerIndex) => (
                              <SelectItem key={partnerIndex} value={partnerIndex.toString()}>
                                {partner.name || `Съдружник ${partnerIndex + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {manager.partnerIndex !== undefined && companyData.partners[manager.partnerIndex] && (
                          <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                            <p>
                              <strong>ЕГН:</strong> {companyData.partners[manager.partnerIndex].egn}
                            </p>
                            <p>
                              <strong>Адрес:</strong> {companyData.partners[manager.partnerIndex].address}
                            </p>
                            <p>
                              <strong>Лична карта:</strong> {companyData.partners[manager.partnerIndex].idNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`manager-${index}-name`}>Име и фамилия *</Label>
                          <Input
                            id={`manager-${index}-name`}
                            value={manager.name}
                            onChange={(e) => updateManager(index, "name", e.target.value)}
                            placeholder="напр. Петър Иванов"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`manager-${index}-egn`}>ЕГН *</Label>
                          <Input
                            id={`manager-${index}-egn`}
                            value={manager.egn}
                            onChange={(e) => updateManager(index, "egn", e.target.value)}
                            placeholder="10 цифри"
                            maxLength={10}
                          />
                          {manager.egn && !validateEGN(manager.egn) && (
                            <p className="text-sm text-red-600 mt-1">ЕГН трябва да съдържа точно 10 цифри</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`manager-${index}-address`}>Адрес *</Label>
                          <Input
                            id={`manager-${index}-address`}
                            value={manager.address}
                            onChange={(e) => updateManager(index, "address", e.target.value)}
                            placeholder="напр. гр. София, ул. Витоша 1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`manager-${index}-id`}>Номер на лична карта *</Label>
                          <Input
                            id={`manager-${index}-id`}
                            value={manager.idNumber}
                            onChange={(e) => updateManager(index, "idNumber", e.target.value)}
                            placeholder="напр. 123456789"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`manager-${index}-id-date`}>Дата на издаване *</Label>
                          <Input
                            id={`manager-${index}-id-date`}
                            type="date"
                            value={manager.idIssueDate}
                            onChange={(e) => updateManager(index, "idIssueDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`manager-${index}-id-place`}>Място на издаване *</Label>
                          <Input
                            id={`manager-${index}-id-place`}
                            value={manager.idIssuePlace}
                            onChange={(e) => updateManager(index, "idIssuePlace", e.target.value)}
                            placeholder="напр. МВР София"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <Button variant="outline" onClick={addManager}>
                  Добави управител
                </Button>
              </div>

              {companyData.managers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <Label className="text-base font-medium">Упълномощител на адвоката *</Label>
                  <p className="text-sm text-gray-600 mb-2">Избери кой от управителите да упълномощи адвоката</p>
                  <Select
                    value={companyData.lawyerRepresentative?.toString() || "0"}
                    onValueChange={(value) =>
                      setCompanyData({ ...companyData, lawyerRepresentative: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companyData.managers.map((manager, managerIndex) => (
                        <SelectItem key={managerIndex} value={managerIndex.toString()}>
                          {manager.name || `Управител ${managerIndex + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Назад
                </Button>
                <Button onClick={generateDocument} disabled={!validateStep3() || isGenerating}>
                  {isGenerating ? "Генериране..." : "Генерирай документ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Download className="h-5 w-5 mr-2" />
                Документът е генериран успешно!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-lg text-green-800">
                  Учредителните документи за <strong>{companyData.name}</strong> са готови за изтегляне.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Файлът съдържа всички необходими документи включително декларации за управителите.
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Link href="/">
                  <Button variant="outline">Към началната страница</Button>
                </Link>
                <Button
                  onClick={() => {
                    setStep(1)
                    setCompanyData({
                      name: "",
                      nameEn: "",
                      seat: "",
                      address: "",
                      activity: "",
                      capital: "",
                      shareCount: "",
                      shareValue: "",
                      partnerCount: 2,
                      partners: [
                        { name: "", egn: "", address: "", share: "", idNumber: "", idIssueDate: "", idIssuePlace: "" },
                        { name: "", egn: "", address: "", share: "", idNumber: "", idIssueDate: "", idIssuePlace: "" },
                      ],
                      managers: [
                        {
                          type: "partner",
                          partnerIndex: 0,
                          name: "",
                          egn: "",
                          address: "",
                          idNumber: "",
                          idIssueDate: "",
                          idIssuePlace: "",
                        },
                      ],
                      managementType: "joint",
                      lawyerRepresentative: 0,
                    })
                  }}
                >
                  Създай нов документ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
