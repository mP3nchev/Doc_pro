<div class="wrap">
    <h1>DocGen Dashboard</h1>
    
    <div class="docgen-dashboard">
        <div class="docgen-stats">
            <div class="stat-box">
                <h3>Шаблони</h3>
                <?php
                $template_manager = new DocGen_Template_Manager();
                $templates = $template_manager->get_templates();
                ?>
                <p class="stat-number"><?php echo count($templates); ?></p>
            </div>
            
            <div class="stat-box">
                <h3>Генерирани документи</h3>
                <p class="stat-number">-</p>
                <small>Функционалност за статистики</small>
            </div>
        </div>
        
        <div class="docgen-quick-actions">
            <h2>Бързи действия</h2>
            <a href="<?php echo admin_url('admin.php?page=docgen-templates'); ?>" class="button button-primary">Управление на шаблони</a>
            <a href="<?php echo admin_url('admin.php?page=docgen-create'); ?>" class="button button-secondary">Създай документ</a>
        </div>
        
        <div class="docgen-shortcodes">
            <h2>Shortcodes за frontend</h2>
            <p><strong>За създаване на документи:</strong> <code>[docgen_create]</code></p>
            <p><strong>За управление на шаблони:</strong> <code>[docgen_templates]</code></p>
        </div>
    </div>
</div>
