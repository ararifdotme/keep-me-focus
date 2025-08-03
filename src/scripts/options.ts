/**
 * Options Page Controller
 * 
 * Main controller for the extension's options/settings page. Manages the user interface
 * for creating, editing, and managing site access rules. Handles form validation,
 * rule CRUD operations, preset loading, and provides an interactive drag-and-drop
 * interface for rule management.
 */

import '../styles/main.css';
import { RulesService } from '../services/rulesService';
import { UIService } from '../services/uiService';
import FormService from '../services/formService';
import { SiteRule } from '../types/SiteRule';
import { PresetRule } from '../types/PresetRule';
import { RULE_PRESETS } from '../config/presets';
import DOMPurify from 'dompurify';

/**
 * Controller class for the options page functionality.
 * Coordinates between services to provide a complete rule management interface.
 */
class OptionsController {
  /** Rules management service instance */
  private rulesService: RulesService;

  /** UI management service instance */
  private uiService: UIService;

  /** Form management service instance */
  private formService: FormService;

  /** ID of the rule currently being edited (null if adding new rule) */
  private editingRuleId: string | null = null;

  constructor() {
    this.rulesService = RulesService.getInstance();
    this.uiService = UIService.getInstance();
    this.formService = FormService.getInstance();

    this.initialize();
  }

  /**
   * Initialize the options page controller.
   * Sets up event handlers, sortable functionality, and loads initial data.
   */
  private async initialize(): Promise<void> {
    // Set up UI event handlers
    this.uiService.setEventHandlers({
      onRuleToggle: (ruleId) => this.handleRuleToggle(ruleId),
      onRuleDelete: (ruleId) => this.handleRuleDelete(ruleId),
      onRuleEdit: (ruleId) => this.handleRuleEdit(ruleId),
      onRuleReorder: (newOrder) => this.handleRuleReorder(newOrder)
    });

    // Initialize sortable functionality
    this.uiService.initializeSortable();

    // Set up form controls
    this.setupFormControls();

    // Load and render initial rules
    await this.loadAndRenderRules();
  }

  /**
   * Set up form controls and their event listeners.
   */
  private setupFormControls(): void {
    const actionSelect = document.getElementById('rule-action') as HTMLSelectElement;
    const saveRuleBtn = document.getElementById('save-rule-btn') as HTMLButtonElement;
    const cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;

    // Toggle limit options based on action selection
    actionSelect?.addEventListener('change', () => {
      this.uiService.toggleLimitOptions();
    });

    // Save rule (add or update)
    saveRuleBtn?.addEventListener('click', () => {
      this.handleSaveRule();
    });

    // Cancel edit mode
    cancelEditBtn?.addEventListener('click', () => {
      this.handleCancelEdit();
    });

    // Set up preset button handlers
    this.setupPresetButtons();

    // Initial state
    this.uiService.toggleLimitOptions();
  }
  /**
   * Load rules from storage and render them in the UI.
   * Handles errors gracefully and updates the display.
   */
  private async loadAndRenderRules(): Promise<void> {
    try {
      const rules = await this.rulesService.loadRules();
      this.uiService.renderRules(rules);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  }

  /**
   * Handle saving a rule (either new rule creation or existing rule update).
   * Validates form data and performs the appropriate operation.
   */
  private async handleSaveRule(): Promise<void> {
    const formData = this.formService.getFormData();
    if (!formData) return;

    try {
      if (this.editingRuleId) {
        // Update existing rule
        const updatedRule = await this.rulesService.updateRule(this.editingRuleId, {
          title: formData.title,
          pattern: formData.pattern,
          matchType: formData.matchType,
          action: formData.action
        });

        if (updatedRule) {
          this.formService.showSuccess('Rule updated successfully!');
          this.exitEditMode();
        }
      } else {
        // Add new rule
        await this.rulesService.addRule({
          title: formData.title,
          pattern: formData.pattern,
          matchType: formData.matchType,
          action: formData.action,
          enabled: true
        });

        this.formService.showSuccess('Rule added successfully!');
        this.uiService.clearForm();
      }

      // Refresh the rules list
      await this.loadAndRenderRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Error saving rule. Please try again.');
    }
  }

  private async handleRuleToggle(ruleId: string): Promise<void> {
    try {
      await this.rulesService.toggleRule(ruleId);
      await this.loadAndRenderRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  }

  private async handleRuleDelete(ruleId: string): Promise<void> {
    if (this.formService.showConfirmation('Are you sure you want to delete this rule?')) {
      try {
        const success = await this.rulesService.deleteRule(ruleId);
        if (success) {
          this.formService.showSuccess('Rule deleted successfully!');
          await this.loadAndRenderRules();

          // If we were editing this rule, exit edit mode
          if (this.editingRuleId === ruleId) {
            this.exitEditMode();
          }
        }
      } catch (error) {
        console.error('Error deleting rule:', error);
        alert('Error deleting rule. Please try again.');
      }
    }
  }

  private handleRuleEdit(ruleId: string): void {
    const rule = this.rulesService.getRuleById(ruleId);
    if (!rule) return;

    this.enterEditMode(ruleId, rule);
  }

  private async handleRuleReorder(newOrder: string[]): Promise<void> {
    try {
      await this.rulesService.reorderRules(newOrder);
      this.formService.showSuccess('Rules reordered successfully!');
    } catch (error) {
      console.error('Error reordering rules:', error);
    }
  }

  private enterEditMode(ruleId: string, rule: SiteRule): void {
    this.editingRuleId = ruleId;

    // Populate form with rule data
    this.uiService.populateForm(rule);

    // Update UI to show edit mode
    const saveRuleBtn = document.getElementById('save-rule-btn') as HTMLButtonElement;
    const cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
    const saveRuleText = document.getElementById('save-rule-text') as HTMLSpanElement;
    const saveRuleIcon = document.getElementById('save-rule-icon') as HTMLElement;

    if (saveRuleText) saveRuleText.textContent = 'Update Rule';
    if (cancelEditBtn) {
      cancelEditBtn.classList.add('flex');
      cancelEditBtn.classList.remove('hidden');
    }

    // Change icon to edit icon
    if (saveRuleIcon) {
      saveRuleIcon.innerHTML = DOMPurify.sanitize(`
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      `);
    }

    // Scroll to form
    document.getElementById('add-rule')?.scrollIntoView({ behavior: 'smooth' });
  }

  private exitEditMode(): void {
    this.editingRuleId = null;

    // Reset form
    this.uiService.clearForm();

    // Update UI to show add mode
    const saveRuleText = document.getElementById('save-rule-text') as HTMLSpanElement;
    const cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
    const saveRuleIcon = document.getElementById('save-rule-icon') as HTMLElement;

    if (saveRuleText) saveRuleText.textContent = 'Add Rule';
    if (cancelEditBtn) {
      cancelEditBtn.classList.remove('flex');
      cancelEditBtn.classList.add('hidden');
    }
    // Change icon back to plus
    if (saveRuleIcon) {
      saveRuleIcon.innerHTML = DOMPurify.sanitize(`
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      `);
    }
  }

  private handleCancelEdit(): void {
    this.exitEditMode();
  }

  private populateFormWithPreset(preset: PresetRule): void {
    // Populate form fields with preset data
    (document.getElementById('rule-title') as HTMLInputElement).value = preset.title;
    (document.getElementById('rule-pattern') as HTMLInputElement).value = preset.pattern;
    (document.getElementById('rule-match-type') as HTMLSelectElement).value = preset.matchType;
    (document.getElementById('rule-action') as HTMLSelectElement).value = preset.action.type;

    // Handle limit action specific fields
    if (preset.action.type === 'limit') {
      (document.getElementById('rule-allowed-minutes') as HTMLInputElement).value = preset.action.allowedMinutes.toString();
      (document.getElementById('rule-reset-after-minutes') as HTMLInputElement).value = preset.action.resetAfterMinutes.toString();
      (document.getElementById('rule-delay-minutes') as HTMLInputElement).value = preset.action.delayMinutes.toString();
    } else {
      // Clear limit fields if not a limit action (block or allow)
      (document.getElementById('rule-allowed-minutes') as HTMLInputElement).value = '';
      (document.getElementById('rule-reset-after-minutes') as HTMLInputElement).value = '';
      (document.getElementById('rule-delay-minutes') as HTMLInputElement).value = '';
    }

    // Update the UI to show/hide limit options
    this.uiService.toggleLimitOptions();
  }

  private setupPresetButtons(): void {
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const presetId = target.dataset.preset;
        if (!presetId) return;

        this.handlePresetClick(presetId);
      });
    });
  }

  private handlePresetClick(presetId: string): void {
    const preset = RULE_PRESETS[presetId];
    if (!preset) {
      console.error('Unknown preset:', presetId);
      return;
    }

    try {
      // Exit edit mode if currently editing
      if (this.editingRuleId) {
        this.exitEditMode();
      }

      // Populate the form with preset data
      this.populateFormWithPreset(preset);

      // Show success message
      this.formService.showSuccess(`Preset "${preset.title}" loaded into form. Click "Add Rule" to save.`);

      // Scroll to form
      document.getElementById('rule-title')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading preset:', error);
      alert('Error loading preset. Please try again.');
    }
  }
}

// Initialize the options controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
