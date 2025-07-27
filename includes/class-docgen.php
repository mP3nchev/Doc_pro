<?php

class DocGen {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        
        // Register shortcodes
        add_shortcode('docgen_create', array($this, 'create_document_shortcode'));
        add_shortcode('docgen_templates', array($this, 'templates_shortcode'));
        
        // AJAX handlers
        add_action('wp_ajax_docgen_upload_template', array($this, 'ajax_upload_template'));
        add_action('wp_ajax_docgen_generate_document', array($this, 'ajax_generate_document'));
        add_action('wp_ajax_docgen_delete_template', array($this, 'ajax_delete_template'));
        
        // Public AJAX handlers (for non-logged users)
        add_action('wp_ajax_nopriv_docgen_generate_document', array($this, 'ajax_generate_document'));
    }
    
    public function init() {
        load_plugin_textdomain('docgen', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'DocGen',
            'DocGen',
            'manage_options',
            'docgen',
            array($this, 'admin_page'),
            'dashicons-media-document',
            30
        );
        
        add_submenu_page(
            'docgen',
            'Шаблони',
            'Шаблони',
            'manage_options',
            'docgen-templates',
            array($this, 'templates_admin_page')
        );
        
        add_submenu_page(
            'docgen',
            'Създай документ',
            'Създай документ',
            'manage_options',
            'docgen-create',
            array($this, 'create_admin_page')
        );
    }
    
    public function admin_scripts($hook) {
        if (strpos($hook, 'docgen') !== false) {
            wp_enqueue_script('docgen-admin', DOCGEN_PLUGIN_URL . 'assets/admin.js', array('jquery'), DOCGEN_VERSION, true);
            wp_enqueue_style('docgen-admin', DOCGEN_PLUGIN_URL . 'assets/admin.css', array(), DOCGEN_VERSION);
            
            wp_localize_script('docgen-admin', 'docgen_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('docgen_nonce')
            ));
        }
    }
    
    public function frontend_scripts() {
        wp_enqueue_script('docgen-frontend', DOCGEN_PLUGIN_URL . 'assets/frontend.js', array('jquery'), DOCGEN_VERSION, true);
        wp_enqueue_style('docgen-frontend', DOCGEN_PLUGIN_URL . 'assets/frontend.css', array(), DOCGEN_VERSION);
        
        wp_localize_script('docgen-frontend', 'docgen_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('docgen_nonce')
        ));
    }
    
    public function admin_page() {
        include DOCGEN_PLUGIN_PATH . 'admin/dashboard.php';
    }
    
    public function templates_admin_page() {
        include DOCGEN_PLUGIN_PATH . 'admin/templates.php';
    }
    
    public function create_admin_page() {
        include DOCGEN_PLUGIN_PATH . 'admin/create-document.php';
    }
    
    public function create_document_shortcode($atts) {
        ob_start();
        include DOCGEN_PLUGIN_PATH . 'templates/create-document-form.php';
        return ob_get_clean();
    }
    
    public function templates_shortcode($atts) {
        ob_start();
        include DOCGEN_PLUGIN_PATH . 'templates/templates-form.php';
        return ob_get_clean();
    }
    
    public function ajax_upload_template() {
        check_ajax_referer('docgen_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            wp_die();
        }
        
        $template_manager = new DocGen_Template_Manager();
        $result = $template_manager->upload_template($_FILES['template']);
        
        wp_send_json($result);
        wp_die(); // Always die after an AJAX call
    }
    
    public function ajax_generate_document() {
        check_ajax_referer('docgen_nonce', 'nonce');
        
        $data = json_decode(stripslashes($_POST['data']), true);
        
        $generator = new DocGen_Document_Generator();
        $result = $generator->generate_document($data);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
        wp_die(); // Always die after an AJAX call
    }
    
    public function ajax_delete_template() {
        check_ajax_referer('docgen_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            wp_die();
        }
        
        $template_id = intval($_POST['template_id']);
        $template_manager = new DocGen_Template_Manager();
        $result = $template_manager->delete_template($template_id);
        
        wp_send_json($result);
        wp_die(); // Always die after an AJAX call
    }
    
    public static function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'docgen_templates';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            filename varchar(255) NOT NULL,
            file_path varchar(500) NOT NULL,
            content longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
