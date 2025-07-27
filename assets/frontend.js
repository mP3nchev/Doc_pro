;(($) => {
  // Global formData object to persist data across steps
  let formData = {
    name: "",
    nameEn: "",
    seat: "",
    address: "",
    activity: "",
    capital: "",
    shareCount: "",
    shareValue: "",
    partnerCount: 2,
    partners: [],
    managers: [],
    managementType: "joint",
    lawyerRepresentative: 0,
  }

  // Declare docgen_ajax globally
  const docgen_ajax = window.docgen_ajax

  // Log to confirm script execution
  console.log("DocGen frontend.js loaded and executing. Version: v30") // Incrementing version to v30

  $(document).ready(() => {
    // Initialize form on page load
    window.initializeDocgenForm($)

    // Form submission handler for document generation
    $("#docgen-create-form").on("submit", (e) => {
      e.preventDefault()
      window.generateDocument($)
    })

    // Upload template (frontend)
    $("#docgen-upload-form-frontend").on("submit", function (e) {
      e.preventDefault()

      var formDataUpload = new FormData(this)
      formDataUpload.append("action", "docgen_upload_template")
      formDataUpload.append("nonce", docgen_ajax.nonce) // Use docgen_ajax directly

      $.ajax({
        url: docgen_ajax.ajax_url, // Use docgen_ajax directly
        type: "POST",
        data: formDataUpload,
        processData: false,
        contentType: false,
        success: (response) => {
          if (response.success) {
            alert("Шаблонът е качен успешно!")
            location.reload()
          } else {
            alert("Грешка: " + response.message)
          }
        },
        error: () => {
          alert("Възникна грешка при качването")
        },
      })
    })

    // Delete template (frontend)
    $(".docgen-delete-template").on("click", function () {
      if (!confirm("Сигурни ли сте, че искате да изтриете този шаблон?")) {
        return
      }

      var templateId = $(this).data("id")

      $.ajax({
        url: docgen_ajax.ajax_url, // Use docgen_ajax directly
        type: "POST",
        data: {
          action: "docgen_delete_template",
          template_id: templateId,
          nonce: docgen_ajax.nonce, // Use docgen_ajax directly
        },
        success: (response) => {
          if (response.success) {
            alert("Шаблонът е изтрит успешно!")
            location.reload()
          } else {
            alert("Грешка: " + response.message)
          }
        },
        error: () => {
          alert("Възникна грешка при изтриването")
        },
      })
    })
  })

  // Functions that need to be globally accessible (e.g., from onclick attributes in HTML)
  // They are explicitly attached to the window object.

  window.initializeDocgenForm = ($) => {
    // Ensure partners array is initialized with correct count
    if (formData.partners.length === 0 || formData.partners.length !== formData.partnerCount) {
      const newPartners = []
      for (let i = 0; i < formData.partnerCount; i++) {
        // Retain existing data if possible
        newPartners.push(
          formData.partners[i] || {
            name: "",
            egn: "",
            address: "",
            share: "",
            idNumber: "",
            idIssueDate: "",
            idIssuePlace: "",
            isForeigner: false, // New field
          },
        )
      }
      formData.partners = newPartners
    }
    window.updatePartnersForm(formData.partnerCount, $)

    // Ensure managers array is initialized with at least one manager
    if (formData.managers.length === 0) {
      // Initialize a default manager based on the first partner's structure
      const defaultPartner = formData.partners[0] || {
        name: "",
        egn: "",
        address: "",
        idNumber: "",
        idIssueDate: "",
        idIssuePlace: "",
        isForeigner: false,
      }
      formData.managers.push({
        type: "partner",
        partnerIndex: 0,
        name: defaultPartner.name,
        egn: defaultPartner.egn,
        address: defaultPartner.address,
        idNumber: defaultPartner.idNumber,
        idIssueDate: defaultPartner.idIssueDate,
        idIssuePlace: defaultPartner.idIssuePlace,
        isForeigner: defaultPartner.isForeigner, // New field
      })
    }
    window.updateManagersForm($)

    // Populate initial form data if available (e.g., after a back navigation)
    window.populateFormData($)

    // Partner count change handler
    $("#partner_count").on("change", function () {
      const newCount = Number.parseInt($(this).val())
      // Adjust partners array size, preserving existing data if possible
      const newPartners = []
      for (let i = 0; i < newCount; i++) {
        newPartners.push(
          formData.partners[i] || {
            name: "",
            egn: "",
            address: "",
            share: "",
            idNumber: "",
            idIssueDate: "",
            idIssuePlace: "",
            isForeigner: false,
          },
        )
      }
      formData.partners = newPartners
      formData.partnerCount = newCount
      window.updatePartnersForm(formData.partnerCount, $)
      window.updateManagersForm($) // Update manager partner options
      window.setupValidation($) // Re-setup validation for new elements
    })

    // Setup real-time validation for relevant fields
    window.setupValidation($)
  }

  window.setupValidation = ($) => {
    // Capital validation
    $('input[name="company_capital"], input[name="share_count"], input[name="share_value"]').off(
      "input",
      window.validateCapitalCalculation,
    ) // Remove previous handlers
    $('input[name="company_capital"], input[name="share_count"], input[name="share_value"]').on(
      "input",
      window.validateCapitalCalculation,
    )

    // Partners shares validation (delegated event for dynamically added fields)
    $("#partners-container").off("input", 'input[name*="[share]"]', window.validatePartnersCapital)
    $("#partners-container").on("input", 'input[name*="[share]"]', window.validatePartnersCapital)

    // EGN validation for partners (delegated event)
    $("#partners-container").off("input", 'input[name*="[egn]"]', () => {}) // Remove generic handler
    $("#partners-container").on("input", 'input[name*="[egn]"]', function () {
      const index = $(this)
        .attr("name")
        .match(/\[(\d+)\]/)[1]
      const isForeigner = $(`input[name="partners[${index}][isForeigner]"]`).prop("checked")
      window.validateEGN($(this).val(), $(this), isForeigner)
    })
    // EGN validation for partners (delegated event for checkbox change)
    $("#partners-container").off("change", 'input[name*="[isForeigner]"]', () => {})
    $("#partners-container").on("change", 'input[name*="[isForeigner]"]', function () {
      const index = $(this)
        .attr("name")
        .match(/\[(\d+)\]/)[1]
      const egnInput = $(`input[name="partners[${index}][egn]"]`)
      const isForeigner = $(this).prop("checked")
      window.validateEGN(egnInput.val(), egnInput, isForeigner)
    })

    // EGN validation for external managers (delegated event)
    $("#managers-container").off("input", 'input[name*="[egn]"]', () => {})
    $("#managers-container").on("input", 'input[name*="[egn]"]', function () {
      const index = $(this)
        .attr("name")
        .match(/\[(\d+)\]/)[1]
      const isForeigner = $(`input[name="managers[${index}][isForeigner]"]`).prop("checked")
      window.validateEGN($(this).val(), $(this), isForeigner)
    })
    // EGN validation for external managers (delegated event for checkbox change)
    $("#managers-container").off("change", 'input[name*="[isForeigner]"]', () => {})
    $("#managers-container").on("change", 'input[name*="[isForeigner]"]', function () {
      const index = $(this)
        .attr("name")
        .match(/\[(\d+)\]/)[1]
      const egnInput = $(`input[name="managers[${index}][egn]"]`)
      const isForeigner = $(this).prop("checked")
      window.validateEGN(egnInput.val(), egnInput, isForeigner)
    })
  }

  window.validateEGN = (egn, $inputElement, isForeigner = false) => {
    // If it's a foreigner, no 10-digit check
    if (isForeigner) {
      if (!egn) {
        let errorSpan = $inputElement.next(".egn-error")
        if (!errorSpan.length) {
          errorSpan = $(
            "<span class='egn-error' style='color: red; font-size: 0.8em; display: block; margin-top: 4px;'></span>",
          )
          $inputElement.after(errorSpan)
        }
        errorSpan.text("Моля, попълнете ЕГН/Идентификационен номер.")
        errorSpan.show()
        return false
      } else {
        $inputElement.next(".egn-error").hide()
        return true
      }
    }

    // Standard 10-digit EGN validation for non-foreigners
    const isValid = /^\d{10}$/.test(egn)
    let errorSpan = $inputElement.next(".egn-error")
    if (!errorSpan.length) {
      errorSpan = $(
        "<span class='egn-error' style='color: red; font-size: 0.8em; display: block; margin-top: 4px;'></span>",
      )
      $inputElement.after(errorSpan)
    }

    if (egn && !isValid) {
      errorSpan.text("ЕГН трябва да съдържа точно 10 цифри")
      errorSpan.show()
      return false
    } else {
      errorSpan.hide()
      return true
    }
  }

  window.validateCapitalCalculation = () => {
    const capital = Number.parseFloat($('input[name="company_capital"]').val()) || 0
    const shareCount = Number.parseFloat($('input[name="share_count"]').val()) || 0
    const shareValue = Number.parseFloat($('input[name="share_value"]').val()) || 0
    const calculatedCapital = shareCount * shareValue

    const errorDiv = $("#capital-validation-error")

    if (capital && shareCount && shareValue && Math.abs(capital - calculatedCapital) > 0.01) {
      errorDiv.text(
        `Капиталът (${capital} лв.) не съвпада с изчислението: ${shareCount} дяла × ${shareValue} лв. = ${calculatedCapital} лв.`,
      )
      errorDiv.show()
      return false
    } else {
      errorDiv.hide()
      return true
    }
  }

  window.validatePartnersCapital = () => {
    const totalCapital = Number.parseFloat($('input[name="company_capital"]').val()) || 0
    let totalShares = 0

    // Use formData.partners for validation as it's the source of truth
    formData.partners.forEach((partner) => {
      totalShares += Number.parseFloat(partner.share) || 0
    })

    const errorDiv = $("#partners-validation-error")

    if (totalCapital && Math.abs(totalCapital - totalShares) > 0.01) {
      errorDiv.text(`Капиталът (${totalCapital} лв.) не съвпада със сумата от дяловете (${totalShares} лв.)`)
      errorDiv.show()
      return false
    } else {
      errorDiv.hide()
      return true
    }
  }

  window.validateCurrentStep = ($) => {
    const currentStep = $(".docgen-step.active").data("step")
    let isValid = true
    let errorMessage = ""

    if (currentStep === 1) {
      // Validate Company Data
      if (
        !formData.name ||
        !formData.nameEn ||
        !formData.seat ||
        !formData.address ||
        !formData.activity ||
        !formData.capital ||
        !formData.shareCount ||
        !formData.shareValue
      ) {
        isValid = false
        errorMessage = "Моля попълнете всички задължителни полета за дружеството."
      } else if (!window.validateCapitalCalculation()) {
        isValid = false
        errorMessage = $("#capital-validation-error").text()
      }
    } else if (currentStep === 2) {
      // Validate Partners Data
      if (formData.partners.length === 0) {
        isValid = false
        errorMessage = "Трябва да има поне един съдружник."
      } else {
        for (let i = 0; i < formData.partners.length; i++) {
          const partner = formData.partners[i]
          if (
            !partner.name ||
            !partner.egn ||
            !partner.address ||
            !partner.share ||
            !partner.idNumber ||
            !partner.idIssueDate ||
            !partner.idIssuePlace
          ) {
            isValid = false
            errorMessage = `Моля попълнете всички задължителни полета за съдружник ${i + 1}.`
            break
          }
          if (!window.validateEGN(partner.egn, $(`input[name="partners[${i}][egn]"]`), partner.isForeigner)) {
            isValid = false
            errorMessage = `Невалидно ЕГН за съдружник ${i + 1}.`
            break
          }
        }
        if (isValid && !window.validatePartnersCapital()) {
          isValid = false
          errorMessage = $("#partners-validation-error").text()
        }
      }
    } else if (currentStep === 3) {
      // Validate Managers Data
      if (formData.managers.length === 0) {
        isValid = false
        errorMessage = "Трябва да има поне един управител."
      } else {
        for (let i = 0; i < formData.managers.length; i++) {
          const manager = formData.managers[i]
          let managerDataForValidation = manager // Default to manager's own data

          // If manager is a partner, use the partner's saved data for validation
          if (manager.type === "partner" && manager.partnerIndex !== undefined) {
            managerDataForValidation = formData.partners[manager.partnerIndex] || managerDataForValidation
          }

          if (
            !managerDataForValidation.name ||
            !managerDataForValidation.egn ||
            !managerDataForValidation.address ||
            !managerDataForValidation.idNumber ||
            !managerDataForValidation.idIssueDate ||
            !managerDataForValidation.idIssuePlace
          ) {
            isValid = false
            errorMessage = `Моля попълнете всички задължителни полета за управител ${i + 1}.`
            break
          }
          // Use the correct input element for EGN, or a placeholder if it's a partner manager
          // The 'required' attribute handling in updateManagersForm should prevent 'not focusable' errors.
          // This validation here is for the *data*, not the DOM element's focusability.
          const egnInput =
            manager.type === "external"
              ? $(`input[name="managers[${i}][egn]"]`)
              : $(`<input type="hidden" value="${managerDataForValidation.egn}"/>`) // Dummy for validation function
          if (!window.validateEGN(managerDataForValidation.egn, egnInput, managerDataForValidation.isForeigner)) {
            isValid = false
            errorMessage = `Невалидно ЕГН за управител ${i + 1}.`
            break
          }
        }
      }
      if (isValid && formData.managers.length > 0 && formData.lawyerRepresentative === undefined) {
        isValid = false
        errorMessage = "Моля изберете упълномощител на адвоката."
      }
    }

    if (!isValid) {
      alert(errorMessage)
    }
    return isValid
  }

  window.docgenNextStep = (step, $) => {
    // Save current step data before moving
    window.saveCurrentStepData($)

    // Validate current step before proceeding
    if (!window.validateCurrentStep($)) {
      return
    }

    // Update progress indicator
    $(".progress-step").removeClass("active completed")
    $(`.progress-step[data-step="${step}"]`).addClass("active")
    for (let i = 1; i < step; i++) {
      $(`.progress-step[data-step="${i}"]`).addClass("completed")
    }

    // Show the target step and hide others
    $(".docgen-step").removeClass("active")
    $(`.docgen-step[data-step="${step}"]`).addClass("active")

    // Re-populate form data for the new step
    window.populateFormData($)

    // Scroll to top of the form
    $("html, body").animate({ scrollTop: 0 }, 300)
  }

  window.saveCurrentStepData = ($) => {
    const currentStep = $(".docgen-step.active").data("step")

    if (currentStep === 1) {
      formData.name = $('input[name="company_name"]').val()
      formData.nameEn = $('input[name="company_name_en"]').val()
      formData.seat = $('input[name="company_seat"]').val()
      formData.address = $('input[name="company_address"]').val()
      formData.activity = $('textarea[name="company_activity"]').val()
      formData.capital = $('input[name="company_capital"]').val()
      formData.shareCount = $('input[name="share_count"]').val()
      formData.shareValue = $('input[name="share_value"]').val()
      formData.partnerCount = Number.parseInt($("#partner_count").val())
    } else if (currentStep === 2) {
      formData.partners = [] // Clear and re-populate to ensure current DOM state
      for (let i = 0; i < formData.partnerCount; i++) {
        formData.partners.push({
          name: $(`input[name="partners[${i}][name]"]`).val(),
          egn: $(`input[name="partners[${i}][egn]"]`).val(),
          address: $(`input[name="partners[${i}][address]"]`).val(),
          share: $(`input[name="partners[${i}][share]"]`).val(),
          idNumber: $(`input[name="partners[${i}][idNumber]"]`).val(),
          idIssueDate: $(`input[name="partners[${i}][idIssueDate]"]`).val(),
          idIssuePlace: $(`input[name="partners[${i}][idIssuePlace]"]`).val(),
          isForeigner: $(`input[name="partners[${i}][isForeigner]"]`).prop("checked"), // Save new field
        })
      }
    } else if (currentStep === 3) {
      formData.managementType = $('input[name="management_type"]:checked').val()
      formData.lawyerRepresentative = Number.parseInt($("#lawyer_representative").val()) || 0

      formData.managers = [] // Clear and re-populate
      $(".manager-section").each(function (index) {
        const managerType = $(this)
          .find('input[name="managers[' + index + '][type]"]:checked')
          .val()

        if (managerType === "partner") {
          const partnerIndex = Number.parseInt(
            $(this)
              .find('select[name="managers[' + index + '][partnerIndex]"]')
              .val(),
          )
          const partner = formData.partners[partnerIndex] || {} // Fallback for safety
          formData.managers.push({
            type: "partner",
            partnerIndex: partnerIndex,
            name: partner.name || "",
            egn: partner.egn || "",
            address: partner.address || "",
            idNumber: partner.idNumber || "",
            idIssueDate: partner.idIssueDate || "",
            idIssuePlace: partner.idIssuePlace || "",
            isForeigner: partner.isForeigner || false, // Propagate from partner
          })
        } else {
          formData.managers.push({
            type: "external",
            name: $(this)
              .find('input[name="managers[' + index + '][name]"]')
              .val(),
            egn: $(this)
              .find('input[name="managers[' + index + '][egn]"]')
              .val(),
            address: $(this)
              .find('input[name="managers[' + index + '][address]"]')
              .val(),
            idNumber: $(this)
              .find('input[name="managers[' + index + '][idNumber]"]')
              .val(),
            idIssueDate: $(this)
              .find('input[name="managers[' + index + '][idIssueDate]"]')
              .val(),
            idIssuePlace: $(this)
              .find('input[name="managers[' + index + '][idIssuePlace]"]')
              .val(),
            isForeigner: $(this)
              .find('input[name="managers[' + index + '][isForeigner]"]')
              .prop("checked"), // Save new field
          })
        }
      })
    }
  }

  window.populateFormData = ($) => {
    const currentStep = $(".docgen-step.active").data("step")

    if (currentStep === 1) {
      $('input[name="company_name"]').val(formData.name)
      $('input[name="company_name_en"]').val(formData.nameEn)
      $('input[name="company_seat"]').val(formData.seat)
      $('input[name="company_address"]').val(formData.address)
      $('textarea[name="company_activity"]').val(formData.activity)
      $('input[name="company_capital"]').val(formData.capital)
      $('input[name="share_count"]').val(formData.shareCount)
      $('input[name="share_value"]').val(formData.shareValue)
      $("#partner_count").val(formData.partnerCount.toString())
      window.validateCapitalCalculation() // Re-run validation on load
    } else if (currentStep === 2) {
      window.updatePartnersForm(formData.partnerCount, $) // Re-render partners based on current count
      for (let i = 0; i < formData.partners.length; i++) {
        const partner = formData.partners[i]
        $(`input[name="partners[${i}][name]"]`).val(partner.name)
        $(`input[name="partners[${i}][egn]"]`).val(partner.egn)
        $(`input[name="partners[${i}][address]"]`).val(partner.address)
        $(`input[name="partners[${i}][share]"]`).val(partner.share)
        $(`input[name="partners[${i}][idNumber]"]`).val(partner.idNumber)
        $(`input[name="partners[${i}][idIssueDate]"]`).val(partner.idIssueDate)
        $(`input[name="partners[${i}][idIssuePlace]"]`).val(partner.idIssuePlace)
        $(`input[name="partners[${i}][isForeigner]"]`).prop("checked", partner.isForeigner) // Set new field
        window.validateEGN(partner.egn, $(`input[name="partners[${i}][egn]"]`), partner.isForeigner) // Re-validate EGN
      }
      window.validatePartnersCapital() // Re-run validation on load
    } else if (currentStep === 3) {
      $('input[name="management_type"][value="' + formData.managementType + '"]').prop("checked", true)
      window.updateManagersForm($) // Re-render managers
      for (let i = 0; i < formData.managers.length; i++) {
        const manager = formData.managers[i]
        const managerSection = $(`.manager-section[data-index="${i}"]`)

        managerSection
          .find('input[name="managers[' + i + '][type]"][value="' + manager.type + '"]')
          .prop("checked", true)
          .trigger("change") // Trigger change to show/hide fields and set required attributes

        if (manager.type === "partner") {
          managerSection.find('select[name="managers[' + i + '][partnerIndex]"]').val(manager.partnerIndex.toString())
          // Display partner's data in the info box
          const partner = formData.partners[manager.partnerIndex]
          if (partner) {
            managerSection
              .find(".partner-info-box")
              .html(`
              <p><strong>Име:</strong> ${partner.name}</p>
              <p><strong>ЕГН:</strong> ${partner.egn} ${partner.isForeigner ? "(чужденец)" : ""}</p>
              <p><strong>Адрес:</strong> ${partner.address}</p>
              <p><strong>Лична карта:</strong> ${partner.idNumber}</p>
              <p><strong>Дата издаване:</strong> ${partner.idIssueDate}</p>
              <p><strong>Място издаване:</strong> ${partner.idIssuePlace}</p>
            `)
              .show()
          } else {
            managerSection.find(".partner-info-box").empty().hide()
          }
        } else {
          managerSection.find('input[name="managers[' + i + '][name]"]').val(manager.name)
          managerSection.find('input[name="managers[' + i + '][egn]"]').val(manager.egn)
          managerSection.find('input[name="managers[' + i + '][address]"]').val(manager.address)
          managerSection.find('input[name="managers[' + i + '][idNumber]"]').val(manager.idNumber)
          managerSection.find('input[name="managers[' + i + '][idIssueDate]"]').val(manager.idIssueDate)
          managerSection.find('input[name="managers[' + i + '][idIssuePlace]"]').val(manager.idIssuePlace)
          managerSection.find('input[name="managers[' + i + '][isForeigner]"]').prop("checked", manager.isForeigner) // Set new field
          window.validateEGN(
            manager.egn,
            managerSection.find('input[name="managers[' + i + '][egn]"]'),
            manager.isForeigner,
          ) // Re-validate EGN
        }
      }
      $("#lawyer_representative").val(formData.lawyerRepresentative.toString())
    }
  }

  window.updatePartnersForm = (count, $) => {
    const container = $("#partners-container")
    container.empty()

    for (let i = 0; i < count; i++) {
      const partnerData = formData.partners[i] || {}
      const partnerHtml = `
        <div class="partner-section">
          <h4>Съдружник ${i + 1}</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Име и фамилия *</label>
              <input type="text" name="partners[${i}][name]" placeholder="напр. Иван Петров" required value="${partnerData.name || ""}">
            </div>
            <div class="form-group">
              <label>ЕГН *</label>
              <input type="text" name="partners[${i}][egn]" placeholder="10 цифри" maxlength="10" required value="${partnerData.egn || ""}">
              <label class="checkbox-label" style="margin-top: 5px;">
                  <input type="checkbox" name="partners[${i}][isForeigner]" ${partnerData.isForeigner ? "checked" : ""}>
                  <span class="checkbox-custom"></span>
                  Лицето е чужденец
              </label>
            </div>
            <div class="form-group full-width">
              <label>Адрес *</label>
              <input type="text" name="partners[${i}][address]" placeholder="напр. гр. София, ул. Витоша 1" required value="${partnerData.address || ""}">
            </div>
            <div class="form-group">
              <label>Дял (лв.) *</label>
              <input type="number" name="partners[${i}][share]" placeholder="напр. 1" step="0.01" required value="${partnerData.share || ""}">
            </div>
            <div class="form-group">
              <label>Номер на лична карта *</label>
              <input type="text" name="partners[${i}][idNumber]" placeholder="напр. 123456789" required value="${partnerData.idNumber || ""}">
            </div>
            <div class="form-group">
              <label>Дата на издаване *</label>
              <input type="date" name="partners[${i}][idIssueDate]" required value="${partnerData.idIssueDate || ""}">
            </div>
            <div class="form-group">
              <label>Място на издаване *</label>
              <input type="text" name="partners[${i}][idIssuePlace]" placeholder="напр. МВР София" required value="${partnerData.idIssuePlace || ""}">
            </div>
          </div>
        </div>
      `
      container.append(partnerHtml)
      // Re-run EGN validation on newly added inputs
      window.validateEGN(
        $(`input[name="partners[${i}][egn]"]`).val(),
        $(`input[name="partners[${i}][egn]"]`),
        partnerData.isForeigner,
      )
    }
  }

  window.updateManagersForm = ($) => {
    const container = $("#managers-container")
    container.empty()

    formData.managers.forEach((manager, index) => {
      // Get the corresponding partner data if type is 'partner'
      const partnerForManager =
        manager.type === "partner" && manager.partnerIndex !== undefined
          ? formData.partners[manager.partnerIndex]
          : null

      const managerHtml = `
        <div class="manager-section" data-index="${index}">
          ${index > 0 ? `<button type="button" class="remove-btn" onclick="window.removeManager(${index}, jQuery)">Премахни</button>` : ""}
          <h4>Управител ${index + 1}</h4>
          
          <div class="form-group">
            <label>Тип управител *</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="managers[${index}][type]" value="partner" ${manager.type === "partner" ? "checked" : ""}>
                <span class="radio-custom"></span>
                Съдружник
              </label>
              <label class="radio-label">
                <input type="radio" name="managers[${index}][type]" value="external" ${manager.type === "external" ? "checked" : ""}>
                <span class="radio-custom"></span>
                Външно лице
              </label>
            </div>
          </div>
          
          <div class="partner-select" ${manager.type === "external" ? 'style="display: none;"' : ""}>
            <div class="form-group">
              <label>Избери съдружник *</label>
              <select name="managers[${index}][partnerIndex]">
                ${window.generatePartnerOptions(manager.partnerIndex)}
              </select>
            </div>
            <div class="partner-info-box" style="margin-top: 10px; padding: 10px; background: #e0f2f7; border-radius: 5px; font-size: 0.9em; ${partnerForManager ? "" : "display: none;"}">
              ${
                partnerForManager
                  ? `
                <p><strong>Име:</strong> ${partnerForManager.name}</p>
                <p><strong>ЕГН:</strong> ${partnerForManager.egn} ${partnerForManager.isForeigner ? "(чужденец)" : ""}</p>
                <p><strong>Адрес:</strong> ${partnerForManager.address}</p>
                <p><strong>Лична карта:</strong> ${partnerForManager.idNumber}</p>
                <p><strong>Дата издаване:</strong> ${partnerForManager.idIssueDate}</p>
                <p><strong>Място издаване:</strong> ${partnerForManager.idIssuePlace}</p>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="external-fields" ${manager.type === "partner" ? 'style="display: none;"' : ""}>
            <div class="form-grid">
              <div class="form-group">
                <label>Име и фамилия *</label>
                <input type="text" name="managers[${index}][name]" placeholder="напр. Петър Иванов" value="${manager.type === "external" ? manager.name : ""}" ${manager.type === "external" ? "required" : ""}>
              </div>
              <div class="form-group">
                <label>ЕГН *</label>
                <input type="text" name="managers[${index}][egn]" placeholder="10 цифри" maxlength="10" value="${manager.type === "external" ? manager.egn : ""}" ${manager.type === "external" ? "required" : ""}>
                <label class="checkbox-label" style="margin-top: 5px;">
                  <input type="checkbox" name="managers[${index}][isForeigner]" ${manager.type === "external" && manager.isForeigner ? "checked" : ""}>
                  <span class="checkbox-custom"></span>
                  Лицето е чужденец
                </label>
              </div>
              <div class="form-group full-width">
                <label>Адрес *</label>
                <input type="text" name="managers[${index}][address]" placeholder="напр. гр. София, ул. Витоша 1" value="${manager.type === "external" ? manager.address : ""}" ${manager.type === "external" ? "required" : ""}>
              </div>
              <div class="form-group">
                <label>Номер на лична карта *</label>
                <input type="text" name="managers[${index}][idNumber]" placeholder="напр. 123456789" value="${manager.type === "external" ? manager.idNumber : ""}" ${manager.type === "external" ? "required" : ""}>
              </div>
              <div class="form-group">
                <label>Дата на издаване *</label>
                <input type="date" name="managers[${index}][idIssueDate]" value="${manager.type === "external" ? manager.idIssueDate : ""}" ${manager.type === "external" ? "required" : ""}>
              </div>
              <div class="form-group">
                <label>Място на издаване *</label>
                <input type="text" name="managers[${index}][idIssuePlace]" placeholder="напр. МВР София" value="${manager.type === "external" ? manager.idIssuePlace : ""}" ${manager.type === "external" ? "required" : ""}>
              </div>
            </div>
          </div>
        </div>
      `
      container.append(managerHtml)

      // Add event listeners for this manager's type change
      $(`.manager-section[data-index="${index}"] input[name="managers[${index}][type]"]`).on("change", function () {
        const managerSection = $(this).closest(".manager-section")
        const currentManager = formData.managers[index] // Get the manager data from formData
        const isExternal = $(this).val() === "external"

        managerSection.find(".partner-select").toggle(!isExternal)
        managerSection.find(".partner-info-box").toggle(!isExternal)
        managerSection.find(".external-fields").toggle(isExternal)

        // Set/unset 'required' attribute based on type
        managerSection.find(".external-fields input, .external-fields textarea").prop("required", isExternal)

        if (isExternal) {
          // Clear partner-related fields if switching to external
          managerSection.find('select[name="managers[' + index + '][partnerIndex]"]').val("")
          // Reset current manager data to external defaults
          currentManager.type = "external"
          currentManager.partnerIndex = undefined
          currentManager.name = ""
          currentManager.egn = ""
          currentManager.address = ""
          currentManager.idNumber = ""
          currentManager.idIssueDate = ""
          currentManager.idIssuePlace = ""
          currentManager.isForeigner = false
        } else {
          // Clear external-related fields if switching to partner
          managerSection.find('input[name="managers[' + index + '][name]"]').val("")
          managerSection.find('input[name="managers[' + index + '][egn]"]').val("")
          managerSection.find('input[name="managers[' + index + '][address]"]').val("")
          managerSection.find('input[name="managers[' + index + '][idNumber]"]').val("")
          managerSection.find('input[name="managers[' + index + '][idIssueDate]"]').val("")
          managerSection.find('input[name="managers[' + index + '][idIssuePlace]"]').val("")
          managerSection.find('input[name="managers[' + index + '][isForeigner]"]').prop("checked", false)
          // Reset current manager data to partner defaults, using the first partner's data
          currentManager.type = "partner"
          currentManager.partnerIndex = 0
          const firstPartner = formData.partners[0] || {}
          currentManager.name = firstPartner.name || ""
          currentManager.egn = firstPartner.egn || ""
          currentManager.address = firstPartner.address || ""
          currentManager.idNumber = firstPartner.idNumber || ""
          currentManager.idIssueDate = firstPartner.idIssueDate || ""
          currentManager.idIssuePlace = firstPartner.idIssuePlace || ""
          currentManager.isForeigner = firstPartner.isForeigner || false

          // Update the select box to the first partner and trigger change to update info box
          managerSection
            .find('select[name="managers[' + index + '][partnerIndex]"]')
            .val("0")
            .trigger("change")
        }
        // This is important: update formData after DOM manipulation
        window.saveCurrentStepData($)
      })

      // Event listener for partner selection change
      $(`.manager-section[data-index="${index}"] select[name="managers[${index}][partnerIndex]"]`).on(
        "change",
        function () {
          const selectedPartnerIndex = Number.parseInt($(this).val())
          const partner = formData.partners[selectedPartnerIndex]
          const managerSection = $(this).closest(".manager-section")

          // Update manager data in formData based on selected partner
          const currentManager = formData.managers[index]
          currentManager.partnerIndex = selectedPartnerIndex
          if (partner) {
            currentManager.name = partner.name || ""
            currentManager.egn = partner.egn || ""
            currentManager.address = partner.address || ""
            currentManager.idNumber = partner.idNumber || ""
            currentManager.idIssueDate = partner.idIssueDate || ""
            currentManager.idIssuePlace = partner.idIssuePlace || ""
            currentManager.isForeigner = partner.isForeigner || false
          }
          window.saveCurrentStepData($) // Save updated manager data

          // Update info box for partner managers
          if (manager.type === "partner" && partner) {
            managerSection
              .find(".partner-info-box")
              .html(`
            <p><strong>Име:</strong> ${partner.name}</p>
            <p><strong>ЕГН:</strong> ${partner.egn} ${partner.isForeigner ? "(чужденец)" : ""}</p>
            <p><strong>Адрес:</strong> ${partner.address}</p>
            <p><strong>Лична карта:</strong> ${partner.idNumber}</p>
            <p><strong>Дата издаване:</strong> ${partner.idIssueDate}</p>
            <p><strong>Място издаване:</strong> ${partner.idIssuePlace}</p>
          `)
              .show()
          } else {
            managerSection.find(".partner-info-box").empty().hide()
          }
        },
      )
      // Initial trigger for partner info box display
      if (manager.type === "partner") {
        $(`.manager-section[data-index="${index}"] select[name="managers[${index}][partnerIndex]"]`).trigger("change")
      }
    })

    window.updateLawyerRepresentativeOptions($)
  }

  window.generatePartnerOptions = (selectedIndex = 0) => {
    let options = ""
    for (let i = 0; i < formData.partnerCount; i++) {
      const partnerName = formData.partners[i] ? formData.partners[i].name : `Съдружник ${i + 1}`
      options += `<option value="${i}" ${i === selectedIndex ? "selected" : ""}>${partnerName || `Съдружник ${i + 1}`}</option>`
    }
    return options
  }

  window.addManager = ($) => {
    // Add a default manager, copying data from first partner if available
    const defaultPartner = formData.partners[0] || {
      name: "",
      egn: "",
      address: "",
      idNumber: "",
      idIssueDate: "",
      idIssuePlace: "",
      isForeigner: false,
    }
    formData.managers.push({
      type: "partner",
      partnerIndex: 0,
      name: defaultPartner.name,
      egn: defaultPartner.egn,
      address: defaultPartner.address,
      idNumber: defaultPartner.idNumber,
      idIssueDate: defaultPartner.idIssueDate,
      idIssuePlace: defaultPartner.idIssuePlace,
      isForeigner: defaultPartner.isForeigner,
    })
    window.updateManagersForm($)
    window.saveCurrentStepData($) // Save new manager
  }

  window.removeManager = (index, $) => {
    formData.managers.splice(index, 1)
    // Adjust lawyer representative if the removed manager was selected
    if (formData.lawyerRepresentative === index) {
      formData.lawyerRepresentative = 0 // Default to first remaining manager
    } else if (formData.lawyerRepresentative > index) {
      formData.lawyerRepresentative-- // Shift index if needed
    }
    window.updateManagersForm($)
    window.saveCurrentStepData($) // Save updated managers
  }

  window.updateLawyerRepresentativeOptions = ($) => {
    const select = $("#lawyer_representative")
    select.empty()

    if (formData.managers.length === 0) {
      select.append('<option value="">Няма налични управители</option>')
      select.prop("disabled", true)
      return
    } else {
      select.prop("disabled", false)
    }

    // Populate options only with current managers
    formData.managers.forEach((manager, index) => {
      const managerName = manager.name || `Управител ${index + 1}`
      select.append(`<option value="${index}">${managerName}</option>`)
    })
    select.val(formData.lawyerRepresentative.toString()) // Set selected value
  }

  window.generateDocument = ($) => {
    window.saveCurrentStepData($) // Save data one last time

    if (!window.validateCurrentStep($)) {
      return
    }

    $("#loading-overlay").show() // Show loading spinner

    $.ajax({
      url: docgen_ajax.ajax_url,
      type: "POST",
      data: {
        action: "docgen_generate_document",
        data: JSON.stringify(formData),
        nonce: docgen_ajax.nonce,
      },
      success: (response) => {
        $("#loading-overlay").hide() // Hide loading spinner

        if (response.success) {
          $("#download-link").attr("href", response.data.download_url)
          $("#download-link").attr("download", response.data.filename)
          $("#success-message").text(`Учредителните документи за ${formData.name} са готови за изтегляне.`)
          window.docgenNextStep(4, $) // Move to success step
        } else {
          alert("Грешка: " + response.data.message)
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        $("#loading-overlay").hide() // Hide loading spinner
        console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText)
        alert("Възникна грешка при генерирането на документа. Моля, проверете конзолата за повече информация.")
      },
    })
  }

  window.resetForm = ($) => {
    formData = {
      name: "",
      nameEn: "",
      seat: "",
      address: "",
      activity: "",
      capital: "",
      shareCount: "",
      shareValue: "",
      partnerCount: 2,
      partners: [],
      managers: [],
      managementType: "joint",
      lawyerRepresentative: 0,
    }

    $("#docgen-create-form")[0].reset() // Reset form fields
    window.docgenNextStep(1, $) // Go back to first step
    window.initializeDocgenForm($) // Re-initialize form elements
    window.setupValidation($) // Re-setup validation after reset
  }
})(window.jQuery)
