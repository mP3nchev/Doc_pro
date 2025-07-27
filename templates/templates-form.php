<div class="docgen-templates-frontend">
    <h2>Управление на шаблони</h2>
    
    <?php if (current_user_can('manage_options')): ?>
    <div class="docgen-upload-section">
        <h3>Качи нов шаблон</h3>
        <form id="docgen-upload-form-frontend" enctype="multipart/form-data">
            <p>
                <label>Избери .docx файл:</label><br>
                <input type="file" name="template" accept=".docx" required>
            </p>
            <p>
                <input type="submit" class="button button-primary" value="Качи шаблон">
            </p>
        </form>
    </div>
    <?php endif; ?>
    
    <div class="docgen-templates-list">
        <h3>Налични шаблони</h3>
        <?php
        $template_manager = new DocGen_Template_Manager();
        $templates = $template_manager->get_templates();
        
        if (empty($templates)) {
            echo '<p>Няма качени шаблони.</p>';
        } else {
            foreach ($templates as $template) {
                echo '<div class="template-item">';
                echo '<h4>' . esc_html($template->name) . '</h4>';
                echo '<p>Файл: ' . esc_html($template->filename) . '</p>';
                echo '<p>Дата: ' . esc_html($template->created_at) . '</p>';
                if (current_user_can('manage_options')) {
                    echo '<button class="button docgen-delete-template" data-id="' . $template->id . '">Изтрий</button>';
                }
                echo '</div>';
            }
        }
        ?>
    </div>
</div>
