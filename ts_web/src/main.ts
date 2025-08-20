import { BinaryParser } from './binary-parser';
import { JsonGenerator } from './json-generator';
import { SvgGenerator } from './svg-generator';
import { ProgramData } from './program-data';

class MinillogueXDApp {
  private currentProgramData: ProgramData | null = null;
  private activeTab: 'svg' | 'json' = 'svg';

  constructor() {
    this.initializeEventListeners();
    this.showTab('svg');
  }

  private initializeEventListeners(): void {
    // File input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const fileButton = document.getElementById('file-button') as HTMLButtonElement;
    
    fileButton?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFileSelect(target.files[0]);
      }
    });

    // Tab switching
    const svgTab = document.getElementById('svg-tab');
    const jsonTab = document.getElementById('json-tab');

    svgTab?.addEventListener('click', () => this.showTab('svg'));
    jsonTab?.addEventListener('click', () => this.showTab('json'));
  }

  private async handleFileSelect(file: File): Promise<void> {
    try {
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = 'Parsing file...';
        statusElement.className = 'status loading';
      }

      // Parse the file
      this.currentProgramData = await BinaryParser.parseFile(file);

      // Update UI with parsed data
      this.updateDisplay();

      if (statusElement) {
        statusElement.textContent = `Loaded: ${this.currentProgramData.programName || 'Untitled'}`;
        statusElement.className = 'status success';
      }

    } catch (error) {
      console.error('Error parsing file:', error);
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusElement.className = 'status error';
      }
    }
  }

  private showTab(tabName: 'svg' | 'json'): void {
    this.activeTab = tabName;

    // Update tab buttons
    const svgTab = document.getElementById('svg-tab');
    const jsonTab = document.getElementById('json-tab');

    svgTab?.classList.toggle('active', tabName === 'svg');
    jsonTab?.classList.toggle('active', tabName === 'json');

    // Show/hide content
    const svgContent = document.getElementById('svg-content');
    const jsonContent = document.getElementById('json-content');

    if (svgContent && jsonContent) {
      svgContent.style.display = tabName === 'svg' ? 'block' : 'none';
      jsonContent.style.display = tabName === 'json' ? 'block' : 'none';
    }

    // Update content if we have data
    if (this.currentProgramData) {
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    if (!this.currentProgramData) return;

    if (this.activeTab === 'svg') {
      this.updateSvgDisplay();
    } else {
      this.updateJsonDisplay();
    }
  }

  private updateSvgDisplay(): void {
    if (!this.currentProgramData) return;

    const svgContent = document.getElementById('svg-content');
    if (svgContent) {
      const svgString = SvgGenerator.generate(this.currentProgramData);
      svgContent.innerHTML = svgString;
    }
  }

  private updateJsonDisplay(): void {
    if (!this.currentProgramData) return;

    const jsonContent = document.getElementById('json-content');
    if (jsonContent) {
      const jsonString = JsonGenerator.generate(this.currentProgramData);
      jsonContent.innerHTML = `<pre><code>${this.escapeHtml(jsonString)}</code></pre>`;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MinillogueXDApp());
} else {
  new MinillogueXDApp();
}

// Export for global access if needed
(window as any).MinillogueXDApp = MinillogueXDApp;