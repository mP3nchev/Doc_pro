<?php

class DocGen_Template_Manager {
    
    private $table_name;
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'docgen_templates';
    }
    
    public function upload_template($file) {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return array('success' => false, 'message' => 'Грешка при качването на файла: ' . $file['error']);
        }
        
        $file_info = pathinfo($file['name']);
        if (strtolower($file_info['extension']) !== 'docx') {
            return array('success' => false, 'message' => 'Моля качете .docx файл');
        }
        
        // Create uploads directory if it doesn't exist
        $upload_dir = wp_upload_dir();
        $docgen_dir = $upload_dir['basedir'] . '/docgen-templates/';
        
        if (!file_exists($docgen_dir)) {
            wp_mkdir_p($docgen_dir);
        }
        
        // Generate unique filename
        $filename = sanitize_file_name($file_info['filename']) . '_' . time() . '.docx';
        $file_path = $docgen_dir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            return array('success' => false, 'message' => 'Грешка при запазването на файла');
        }
        
        // Extract text content from docx (simplified).
        // For full formatting preservation, this function would need to store the full
        // word/document.xml content (not stripped tags) or work with a DOCX manipulation library.
        $content = $this->extract_docx_content($file_path);
        
        // Save to database
        global $wpdb;
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'name' => sanitize_text_field($file_info['filename']),
                'filename' => $filename,
                'file_path' => $file_path,
                'content' => $content
            ),
            array('%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            unlink($file_path); // Delete file if database insert failed
            return array('success' => false, 'message' => 'Грешка при запазването в базата данни: ' . $wpdb->last_error);
        }
        
        return array(
            'success' => true,
            'message' => 'Шаблонът е качен успешно',
            'template_id' => $wpdb->insert_id,
            'content' => $content // Return content for preview
        );
    }
    
    public function get_templates() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY created_at DESC");
    }
    
    public function get_template($id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
    }
    
    public function delete_template($id) {
        global $wpdb;
        
        $template = $this->get_template($id);
        if (!$template) {
            return array('success' => false, 'message' => 'Шаблонът не е намерен');
        }
        
        // Delete file
        if (file_exists($template->file_path)) {
            unlink($template->file_path);
        }
        
        // Delete from database
        $result = $wpdb->delete($this->table_name, array('id' => $id), array('%d'));
        
        if ($result === false) {
            return array('success' => false, 'message' => 'Грешка при изтриването: ' . $wpdb->last_error);
        }
        
        return array('success' => true, 'message' => 'Шаблонът е изтрит успешно');
    }
    
    /**
     * Extracts plain text content from a DOCX file.
     * This is a simplified extraction and might not capture all formatting or complex structures.
     *
     * @param string $file_path The path to the DOCX file.
     * @return string The extracted plain text content, or an error message if extraction fails.
     */
    private function extract_docx_content($file_path) {
        if (!class_exists('ZipArchive')) {
            return 'Грешка: PHP разширението ZipArchive не е налично.';
        }

        $zip = new ZipArchive();
        if ($zip->open($file_path) === TRUE) {
            $content = $zip->getFromName('word/document.xml');
            $zip->close();
            
            if ($content) {
                // Remove XML tags and get plain text
                $content = strip_tags($content);
                $content = html_entity_decode($content);
                return $content;
            }
        }
        
        return 'Съдържанието не може да бъде извлечено от DOCX файла.';
    }
}
