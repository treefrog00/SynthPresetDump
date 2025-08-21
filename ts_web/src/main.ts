import { BinaryParser, LibraryData } from './binary-parser';
import { JsonGenerator } from './json-generator';
import { SvgGenerator } from './svg-generator';
import { ProgramData } from './program-data';

class MinillogueXDApp {
  private currentLibraryData: LibraryData | null = null;
  private currentProgramIndex: number = 0;
  private activeTab: 'svg' | 'json' | 'programs' = 'svg';

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
    const programsTab = document.getElementById('programs-tab');

    svgTab?.addEventListener('click', () => this.showTab('svg'));
    jsonTab?.addEventListener('click', () => this.showTab('json'));
    programsTab?.addEventListener('click', () => this.showTab('programs'));
  }

  private async handleFileSelect(file: File): Promise<void> {
    try {
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = 'Parsing file...';
        statusElement.className = 'status loading';
      }

      // Parse the file
      this.currentLibraryData = await BinaryParser.parseFile(file);
      this.currentProgramIndex = 0;

      // Update UI with parsed data
      this.updateDisplay();
      this.updateProgramsTab();

      if (statusElement) {
        const programCount = this.currentLibraryData.programs.length;
        const fileName = this.currentLibraryData.type === 'library' ?
          `Library with ${programCount} programs` :
          this.currentLibraryData.programs[0].programName || 'Untitled';
        statusElement.textContent = `Loaded: ${fileName}`;
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

  private showTab(tabName: 'svg' | 'json' | 'programs'): void {
    this.activeTab = tabName;

    // Update tab buttons
    const svgTab = document.getElementById('svg-tab');
    const jsonTab = document.getElementById('json-tab');
    const programsTab = document.getElementById('programs-tab');

    svgTab?.classList.toggle('active', tabName === 'svg');
    jsonTab?.classList.toggle('active', tabName === 'json');
    programsTab?.classList.toggle('active', tabName === 'programs');

    // Show/hide content
    const svgContent = document.getElementById('svg-content');
    const jsonContent = document.getElementById('json-content');
    const programsContent = document.getElementById('programs-content');

    if (svgContent && jsonContent && programsContent) {
      svgContent.style.display = tabName === 'svg' ? 'block' : 'none';
      jsonContent.style.display = tabName === 'json' ? 'block' : 'none';
      programsContent.style.display = tabName === 'programs' ? 'block' : 'none';
    }

    // Update content if we have data
    if (this.currentLibraryData) {
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    if (!this.currentLibraryData || this.currentLibraryData.programs.length === 0) return;

    if (this.activeTab === 'svg') {
      this.updateSvgDisplay();
    } else if (this.activeTab === 'json') {
      this.updateJsonDisplay();
    }
    // Programs tab is handled separately
  }

  private updateSvgDisplay(): void {
    if (!this.currentLibraryData || this.currentLibraryData.programs.length === 0) return;

    const svgContent = document.getElementById('svg-content');
    if (svgContent) {
      const currentProgram = this.currentLibraryData.programs[this.currentProgramIndex];
      const svgString = SvgGenerator.generate(currentProgram);
      svgContent.innerHTML = svgString;
    }
  }

  private updateJsonDisplay(): void {
    if (!this.currentLibraryData || this.currentLibraryData.programs.length === 0) return;

    const jsonContent = document.getElementById('json-content');
    if (jsonContent) {
      const currentProgram = this.currentLibraryData.programs[this.currentProgramIndex];
      const jsonString = JsonGenerator.generate(currentProgram);
      jsonContent.innerHTML = `<pre><code>${this.escapeHtml(jsonString)}</code></pre>`;
    }
  }

  private updateProgramsTab(): void {
    if (!this.currentLibraryData) return;

    const programsContent = document.getElementById('programs-content');
    if (!programsContent) return;

    if (this.currentLibraryData.type === 'single') {
      // Single program - show program info
      const program = this.currentLibraryData.programs[0];
      programsContent.innerHTML = `
        <div class="program-info">
          <h3>Program: ${program.programName || 'Untitled'}</h3>
          <p>Single program file loaded</p>
        </div>
      `;
    } else {
      // Library - show list of programs
      const programsList = this.currentLibraryData.programs.map((program, index) => {
        const isActive = index === this.currentProgramIndex;
        const programName = program.programName || `Program ${index + 1}`;
        return `
          <div class="program-item ${isActive ? 'active' : ''}" data-index="${index}">
            <span class="program-name">${programName}</span>
            <span class="program-index">${index + 1}</span>
          </div>
        `;
      }).join('');

      programsContent.innerHTML = `
        <div class="programs-header">
          <h3>Library: ${this.currentLibraryData.originalFile.name}</h3>
          <p>${this.currentLibraryData.programs.length} programs</p>
        </div>
        <div class="programs-list">
          ${programsList}
        </div>
      `;

      // Add click event listeners to program items
      const programItems = programsContent.querySelectorAll('.program-item');
      programItems.forEach((item, index) => {
        item.addEventListener('click', () => this.selectProgram(index));
      });
    }
  }

  private selectProgram(index: number): void {
    if (!this.currentLibraryData || index < 0 || index >= this.currentLibraryData.programs.length) return;

    this.currentProgramIndex = index;
    this.updateProgramsTab();
    this.updateDisplay();
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