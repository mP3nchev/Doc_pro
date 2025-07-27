<?php

class DocGen_Document_Generator {
    
    public function generate_document($data) {
        try {
            // Get uploaded template
            $template_manager = new DocGen_Template_Manager();
            $templates = $template_manager->get_templates();
            
            if (empty($templates)) {
                return array(
                    'success' => false, 
                    'message' => 'Няма качени шаблони. Моля качете .docx шаблон първо.'
                );
            }
            
            // Use the content of the first available template (which is plain text extracted during upload)
            $template_content = $templates[0]->content;
            
            // Process the plain text content with the provided data
            $processed_content = $this->process_template($template_content, $data);
            
            // Generate output filename
            $output_filename = sanitize_file_name($data['name']) . '_' . date('Y-m-d_H-i-s') . '.docx';
            $upload_dir = wp_upload_dir();
            $output_path = $upload_dir['basedir'] . '/docgen-output/' . $output_filename;
            
            // Create output directory if it doesn't exist
            $output_dir = dirname($output_path);
            if (!file_exists($output_dir)) {
                wp_mkdir_p($output_dir);
            }
            
            // Create a simple DOCX file from the processed plain text
            // IMPORTANT: This method creates a minimalist DOCX from plain text.
            // It does NOT preserve rich formatting (bold, fonts, alignment) from the original template.
            // For full formatting preservation, a dedicated PHP DOCX manipulation library (e.g., PHPWord)
            // that parses and modifies the original DOCX's internal XML structure is required.
            $this->create_docx_file($processed_content, $output_path);
            
            // Create download URL
            $download_url = $upload_dir['baseurl'] . '/docgen-output/' . $output_filename;
            // Force HTTPS for download URL to avoid mixed content warnings
            $download_url = str_replace('http://', 'https://', $download_url);

            return array(
                'success' => true,
                'message' => 'Документът е генериран успешно',
                'download_url' => $download_url,
                'filename' => $output_filename
            );
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => 'Грешка при генерирането: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * Processes a plain text template with provided data.
     * This function replaces placeholders like {{field_name}} and {{#loop}}...{{/loop}}.
     *
     * @param string $template The plain text template content.
     * @param array $data The data to populate the template with.
     * @return string The processed template content.
     */
    private function process_template($template, $data) {
        $content = $template;
        
        // Process simple variables
        $content = str_replace('{{company_name}}', $data['name'], $content);
        $content = str_replace('{{company_name_en}}', $data['nameEn'], $content);
        $content = str_replace('{{company_seat}}', $data['seat'], $content);
        $content = str_replace('{{company_address}}', $data['address'], $content);
        $content = str_replace('{{company_activity}}', $data['activity'], $content);
        $content = str_replace('{{company_capital}}', $data['capital'], $content);
        $content = str_replace('{{share_count}}', $data['shareCount'], $content);
        $content = str_replace('{{share_value}}', $data['shareValue'], $content);
        $content = str_replace('{{current_date}}', date('d.m.Y'), $content);
        
        // Process management type
        $management_text = $data['managementType'] === 'joint' ? 'заедно' : 'поотделно';
        $content = str_replace('{{management_type_text}}', $management_text, $content);
        
        // Process lawyer representative
        if (isset($data['lawyerRepresentative']) && isset($data['managers'][$data['lawyerRepresentative']])) {
            $content = str_replace('{{lawyer_representative_name}}', $data['managers'][$data['lawyerRepresentative']]['name'], $content);
        }
        
        // Process partners loop
        $content = $this->process_loop($content, 'partners', $data['partners'], function($partner, $index) use ($data) {
            $percentage = ($data['capital'] > 0) ? ($partner['share'] / $data['capital']) * 100 : 0;
            return array(
                'partner_index' => $index + 1,
                'partner_name' => $partner['name'],
                'partner_egn' => $partner['egn'],
                'partner_address' => $partner['address'],
                'partner_share' => $partner['share'],
                'partner_percentage' => number_format($percentage, 2),
                'partner_id_number' => $partner['idNumber'],
                'partner_id_issue_date' => $partner['idIssueDate'],
                'partner_id_issue_place' => $partner['idIssuePlace'],
                'partner_is_foreigner' => $partner['isForeigner'] ? 'Да' : 'Не' // New field
            );
        });
        
        // Process managers loop
        $content = $this->process_loop($content, 'managers', $data['managers'], function($manager, $index) {
            return array(
                'manager_index' => $index + 1,
                'manager_name' => $manager['name'],
                'manager_egn' => $manager['egn'],
                'manager_address' => $manager['address'],
                'manager_id_number' => $manager['idNumber'],
                'manager_id_issue_date' => $manager['idIssueDate'],
                'manager_id_issue_place' => $manager['idIssuePlace'],
                'manager_is_foreigner' => $manager['isForeigner'] ? 'Да' : 'Не' // New field
            );
        });
        
        return $content;
    }
    
    /**
     * Processes a loop section in the template.
     *
     * @param string $content The full template content.
     * @param string $loop_name The name of the loop (e.g., 'partners', 'managers').
     * @param array $data_array The array of data for the loop.
     * @param callable $mapper A callback function to map each item in $data_array to an associative array of placeholders.
     * @return string The content with the loop processed.
     */
    private function process_loop($content, $loop_name, $data_array, $mapper) {
        $pattern = '/\{\{#' . $loop_name . '\}\}(.*?)\{\{\/' . $loop_name . '\}\}/s';
        
        return preg_replace_callback($pattern, function($matches) use ($data_array, $mapper) {
            $template = $matches[1]; // The content inside the loop markers
            $result = '';
            
            foreach ($data_array as $index => $item) {
                $mapped_data = $mapper($item, $index);
                $item_content = $template;
                
                foreach ($mapped_data as $key => $value) {
                    $item_content = str_replace('{{' . $key . '}}', $value, $item_content);
                }
                
                $result .= $item_content;
            }
            
            return $result;
        }, $content);
    }
    
    /**
     * Creates a simple DOCX file from plain text content.
     * This function generates a minimal DOCX structure.
     * Newlines in the content are converted to <w:p><w:r><w:t>...</w:t></w:r></w:p> for new paragraphs.
     *
     * @param string $content The plain text content to put into the DOCX.
     * @param string $output_path The full path where the DOCX file should be saved.
     * @throws Exception If the DOCX file cannot be created.
     */
    private function create_docx_file($content, $output_path) {
        $zip = new ZipArchive();
        
        if ($zip->open($output_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception('Cannot create DOCX file at ' . $output_path);
        }
        
        // Add required DOCX files
        $zip->addFromString('[Content_Types].xml', $this->get_content_types());
        $zip->addFromString('_rels/.rels', $this->get_rels());
        $zip->addFromString('word/_rels/document.xml.rels', $this->get_document_rels());
        $zip->addFromString('word/document.xml', $this->get_document_xml($content));
        
        $zip->close();
    }
    
    // Helper functions to generate minimal DOCX XML parts
    private function get_content_types() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>';
    }
    
    private function get_rels() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>';
    }
    
    private function get_document_rels() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>';
    }
    
    /**
     * Generates the main document.xml content for a DOCX file.
     * It wraps the plain text content in basic WordprocessingML tags.
     * Newlines in the content are converted to <w:p><w:r><w:t>...</w:t></w:r></w:p> for new paragraphs.
     * This will make the output less "crammed" than a single line.
     *
     * @param string $content The plain text content.
     * @return string The XML content for word/document.xml.
     */
    private function get_document_xml($content) {
        // Escape HTML entities for XML
        $xml_content = htmlspecialchars($content, ENT_XML1, 'UTF-8');
        
        // Split content by newlines and wrap each line in a paragraph
        $paragraphs = explode("\n", $xml_content);
        $body_content = '';
        foreach ($paragraphs as $paragraph) {
            // Trim whitespace from lines and add a paragraph tag. Add <w:r><w:t> tags around the text.
            $body_content .= '<w:p><w:r><w:t>' . trim($paragraph) . '</w:t></w:r></w:p>';
        }
        
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>' . $body_content . '</w:body>
</w:document>';
    }
}
