<div class="wrap">
    <h1>Управление на шаблони</h1>
    
    <div class="docgen-upload-section">
        <h2>Качи нов шаблон</h2>
        <form id="docgen-upload-form" enctype="multipart/form-data">
            <table class="form-table">
                <tr>
                    <th scope="row">Избери .docx файл</th>
                    <td>
                        <input type="file" name="template" accept=".docx" required>
                        <p class="description">Качете .docx файл с маркери за полетата</p>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" class="button button-primary" value="Качи шаблон">
            </p>
        </form>
    </div>
    
    <div class="docgen-templates-list">
        <h2>Налични шаблони</h2>
        <?php
        $template_manager = new DocGen_Template_Manager();
        $templates = $template_manager->get_templates();
        
        if (empty($templates)) {
            echo '<p>Няма качени шаблони.</p>';
        } else {
            echo '<table class="wp-list-table widefat fixed striped">';
            echo '<thead><tr><th>Име</th><th>Файл</th><th>Дата</th><th>Действия</th></tr></thead>';
            echo '<tbody>';
            
            foreach ($templates as $template) {
                echo '<tr>';
                echo '<td>' . esc_html($template->name) . '</td>';
                echo '<td>' . esc_html($template->filename) . '</td>';
                echo '<td>' . esc_html($template->created_at) . '</td>';
                echo '<td>';
                echo '<button class="button button-small docgen-delete-template" data-id="' . $template->id . '">Изтрий</button>';
                echo '</td>';
                echo '</tr>';
            }
            
            echo '</tbody></table>';
        }
        ?>
    </div>
</div>
