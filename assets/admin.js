;(($) => {
  // Declare jQuery variable
  const jQuery = window.jQuery

  // Declare docgen_ajax variable
  const docgen_ajax = window.docgen_ajax

  jQuery(document).ready(($) => {
    // Upload template
    $("#docgen-upload-form").on("submit", function (e) {
      e.preventDefault()

      var formData = new FormData(this)
      formData.append("action", "docgen_upload_template")
      formData.append("nonce", docgen_ajax.nonce)

      jQuery.ajax({
        url: docgen_ajax.ajax_url,
        type: "POST",
        data: formData,
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

    // Delete template
    jQuery(".docgen-delete-template").on("click", function () {
      if (!confirm("Сигурни ли сте, че искате да изтриете този шаблон?")) {
        return
      }

      var templateId = jQuery(this).data("id")

      jQuery.ajax({
        url: docgen_ajax.ajax_url,
        type: "POST",
        data: {
          action: "docgen_delete_template",
          template_id: templateId,
          nonce: docgen_ajax.nonce,
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
})(window.jQuery)
