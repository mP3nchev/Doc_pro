<?php
/**
 * Plugin Name: DocGen - Document Generator
 * Plugin URI: https://yoursite.com
 * Description: Автоматично генериране на учредителни документи за ООД с .docx шаблони
 * Version: 1.0.2
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: docgen
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define plugin constants
define('DOCGEN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DOCGEN_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('DOCGEN_VERSION', '1.0.2'); // Updated plugin version

// Include required files
require_once DOCGEN_PLUGIN_PATH . 'includes/class-docgen.php';
require_once DOCGEN_PLUGIN_PATH . 'includes/class-template-manager.php';
require_once DOCGEN_PLUGIN_PATH . 'includes/class-document-generator.php';

// Initialize the plugin
function docgen_init() {
    new DocGen();
}
add_action('plugins_loaded', 'docgen_init');

// Activation hook
register_activation_hook(__FILE__, 'docgen_activate');
function docgen_activate() {
    DocGen::create_tables();
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'docgen_deactivate');
function docgen_deactivate() {
    flush_rewrite_rules();
}

// Custom handler to serve frontend.js without BOM
add_action('wp_loaded', function() {
    if (isset($_GET['docgen_frontend_script']) && $_GET['docgen_frontend_script'] === 'true') {
        $file_path = DOCGEN_PLUGIN_PATH . 'assets/frontend.js';
        if (file_exists($file_path)) {
            $content = file_get_contents($file_path);
            // Remove BOM if present
            if (substr($content, 0, 3) === "\xef\xbb\xbf") {
                $content = substr($content, 3);
            }
            header('Content-Type: application/javascript; charset=UTF-8');
            header('Cache-Control: no-cache, no-store, must-revalidate'); // Ensure no caching
            header('Pragma: no-cache');
            header('Expires: 0');
            echo $content;
            exit;
        }
    }
});
