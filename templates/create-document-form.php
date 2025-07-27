<div class="docgen-modern-container">
    <!-- Progress indicator -->
    <div class="docgen-progress">
        <div class="progress-step active" data-step="1">
            <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
            <span>Дружество</span>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step" data-step="2">
            <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 .95L12.95 10H9c-.55 0-1 .45-1 1s.45 1 1 1h2.54l1.69 1.69c.4.4.9.6 1.42.6s1.02-.2 1.42-.6L17 12.41V22h3z"/>
                </svg>
            </div>
            <span>Съдружници</span>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step" data-step="3">
            <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 15.9 11 17 11S19 10.1 19 11H21V9ZM17 12C15.9 12 15 12.9 15 14V22H17V16H19V22H21V14C21 12.9 20.1 12 19 12H17Z"/>
                </svg>
            </div>
            <span>Управители</span>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step" data-step="4">
            <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
            </div>
            <span>Генериране</span>
        </div>
    </div>

    <form id="docgen-create-form">
        <!-- Step 1: Company Data -->
        <div class="docgen-step active" data-step="1">
            <div class="step-card">
                <div class="step-header">
                    <h2>Данни за дружеството</h2>
                </div>
                <div class="step-content">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Наименование на дружеството *</label>
                            <input type="text" name="company_name" placeholder="напр. ТЕСТ ООД" required>
                        </div>
                        <div class="form-group">
                            <label>Наименование на латиница *</label>
                            <input type="text" name="company_name_en" placeholder="напр. TEST OOD" required>
                        </div>
                        <div class="form-group">
                            <label>Седалище *</label>
                            <input type="text" name="company_seat" placeholder="напр. София" required>
                        </div>
                        <div class="form-group">
                            <label>Брой съдружници *</label>
                            <select name="partner_count" id="partner_count">
                                <option value="2">2 съдружника</option>
                                <option value="3">3 съдружника</option>
                                <option value="4">4 съдружника</option>
                                <option value="5">5 съдружника</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label>Адрес на управление *</label>
                            <input type="text" name="company_address" placeholder="напр. гр. София, ул. Витоша 1" required>
                        </div>
                        <div class="form-group full-width">
                            <label>Предмет на дейност *</label>
                            <textarea name="company_activity" rows="3" placeholder="Опишете основната дейност на дружеството" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Капитал (лв.) *</label>
                            <input type="number" name="company_capital" placeholder="напр. 2" min="2" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Брой дялове *</label>
                            <input type="number" name="share_count" placeholder="напр. 2" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Стойност на дял (лв.) *</label>
                            <input type="number" name="share_value" placeholder="напр. 1" min="0.01" step="0.01" required>
                        </div>
                    </div>
                    <div id="capital-validation-error" class="validation-error" style="display: none;"></div>
                </div>
                <div class="step-actions">
                    <div></div>
                    <button type="button" class="btn btn-primary" onclick="window.docgenNextStep(2, jQuery)">Напред</button>
                </div>
            </div>
        </div>

        <!-- Step 2: Partners Data -->
        <div class="docgen-step" data-step="2">
            <div class="step-card">
                <div class="step-header">
                    <h2>Данни за съдружниците</h2>
                </div>
                <div class="step-content">
                    <div id="partners-container">
                        <!-- Partners will be dynamically generated -->
                    </div>
                    <div id="partners-validation-error" class="validation-error" style="display: none;"></div>
                </div>
                <div class="step-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.docgenNextStep(1, jQuery)">Назад</button>
                    <button type="button" class="btn btn-primary" onclick="window.docgenNextStep(3, jQuery)">Напред</button>
                </div>
            </div>
        </div>

        <!-- Step 3: Managers Data -->
        <div class="docgen-step" data-step="3">
            <div class="step-card">
                <div class="step-header">
                    <h2>Данни за управителите</h2>
                </div>
                <div class="step-content">
                    <div class="form-group">
                        <label>Начин на управление *</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="management_type" value="joint" checked>
                                <span class="radio-custom"></span>
                                Заедно (всички управители подписват заедно)
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="management_type" value="separate">
                                <span class="radio-custom"></span>
                                Поотделно (всеки управител може да подписва самостоятелно)
                            </label>
                        </div>
                    </div>
                    
                    <div id="managers-container">
                        <!-- Managers will be dynamically generated -->
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="window.addManager(jQuery)">Добави управител</button>
                    </div>
                    
                    <div id="lawyer-representative-section" class="form-group">
                        <label>Упълномощител на адвоката *</label>
                        <select name="lawyer_representative" id="lawyer_representative">
                            <!-- Options will be populated dynamically -->
                        </select>
                        <small>Избери кой от управителите да упълномощи адвоката</small>
                    </div>
                </div>
                <div class="step-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.docgenNextStep(2, jQuery)">Назад</button>
                    <button type="submit" class="btn btn-primary" id="generate-btn">Генерирай документ</button>
                </div>
            </div>
        </div>

        <!-- Step 4: Success -->
        <div class="docgen-step" data-step="4">
            <div class="step-card success-card">
                <div class="success-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.41,10.09L6,11.5L11,16.5Z"/>
                    </svg>
                </div>
                <h2>Документът е генериран успешно!</h2>
                <p id="success-message">Учредителните документи са готови за изтегляне.</p>
                <div class="success-actions">
                    <a id="download-link" href="#" class="btn btn-primary" download>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                        </svg>
                        Изтегли документа
                    </a>
                    <button type="button" class="btn btn-secondary" onclick="window.resetForm(jQuery)">Създай нов документ</button>
                </div>
            </div>
        </div>
    </form>
    
    <div id="loading-overlay" style="display: none;">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Генериране на документа...</p>
        </div>
    </div>
</div>
