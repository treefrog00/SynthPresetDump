"""SVG report generator for Minilogue XD program data"""

import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import Optional, Tuple
from .program_data import ProgramData
from .enums import *


class SVGGenerator:
    """Generates SVG diagrams from Minilogue XD program data"""
    
    SVG_NAMESPACE = "http://www.w3.org/2000/svg"
    
    # Layout constants
    PADDING = 10
    STROKE_WIDTH = 3
    
    # Colors
    BACKGROUND_COLOR = "white"
    STROKE_COLOR = "black"
    SWITCH_ACTIVE_COLOR = "red"
    
    # Component dimensions
    KNOB_DIAMETER = 70
    KNOB_RADIUS = KNOB_DIAMETER // 2
    LED_DIAMETER = 20
    LED_RADIUS = LED_DIAMETER // 2
    
    # Layout dimensions
    SYNTH_WIDTH = 2300
    SYNTH_HEIGHT = 970
    HEADER_OFFSET = 35
    ROW_SPACING = 255
    FIRST_ROW_Y = 90
    
    @property
    def preferred_file_extension(self) -> str:
        return ".svg"
    
    def generate_report(self, program_data: ProgramData) -> str:
        """Generate SVG report from program data"""
        viewbox_width = self.SYNTH_WIDTH + self.PADDING * 2
        viewbox_height = self.SYNTH_HEIGHT + self.PADDING * 2
        
        # Create root SVG element
        root = ET.Element("svg")
        root.set("xmlns", self.SVG_NAMESPACE)
        root.set("version", "1.1")
        root.set("width", "1900")
        root.set("preserveAspectRatio", "xMidYMid meet")
        root.set("viewBox", f"0 0 {viewbox_width} {viewbox_height}")
        
        # Add background rectangle
        bg_rect = ET.SubElement(root, "rect")
        bg_rect.set("x", str(self.PADDING))
        bg_rect.set("y", str(self.PADDING))
        bg_rect.set("width", str(self.SYNTH_WIDTH))
        bg_rect.set("height", str(self.SYNTH_HEIGHT))
        bg_rect.set("stroke", self.STROKE_COLOR)
        bg_rect.set("stroke-width", str(self.PADDING))
        bg_rect.set("fill", self.BACKGROUND_COLOR)
        bg_rect.set("rx", "30")
        bg_rect.set("ry", "30")
        
        # Add program title
        title = self._create_text(root, f"Program: {program_data.program_name or 'Untitled'}", 
                                 30, 30, font_size="3em", font_weight="bold")
        
        # Add logo placeholder
        logo_group = ET.SubElement(root, "g")
        logo_text = self._create_text(logo_group, "minilogue xd", 35 + self.PADDING, 890 + self.PADDING, 
                                     font_size="2em", font_weight="bold")
        subtitle_text = self._create_text(logo_group, "POLYPHONIC ANALOGUE SYNTHESIZER", 
                                         35 + self.PADDING, 930 + self.PADDING, font_size="1.2em")
        
        # Add main sections
        self._add_voice_mode_section(root, program_data, 75)
        self._add_oscillator_section(root, program_data, 400)
        self._add_mixer_section(root, program_data, 1070)
        self._add_filter_section(root, program_data, 1215)
        self._add_envelope_section(root, program_data, 1360)
        self._add_effects_section(root, program_data, 1860)
        
        # Convert to string
        return self._prettify_xml(root)
    
    def _create_text(self, parent: ET.Element, text: str, x: int, y: int, 
                    font_size: str = "1.2em", font_weight: str = "normal", 
                    text_anchor: str = "start") -> ET.Element:
        """Create a text element"""
        text_elem = ET.SubElement(parent, "text")
        text_elem.set("x", str(x))
        text_elem.set("y", str(y))
        text_elem.set("font-family", "Arial, sans-serif")
        text_elem.set("font-size", font_size)
        text_elem.set("font-weight", font_weight)
        text_elem.set("text-anchor", text_anchor)
        text_elem.set("dominant-baseline", "hanging")
        text_elem.set("fill", self.STROKE_COLOR)
        text_elem.text = text
        return text_elem
    
    def _create_knob(self, parent: ET.Element, label: str, x: int, y: int, 
                    percent: float) -> ET.Element:
        """Create a knob control"""
        group = ET.SubElement(parent, "g")
        cx = x + self.KNOB_RADIUS
        cy = y + self.KNOB_RADIUS
        
        # Knob circle
        circle = ET.SubElement(group, "circle")
        circle.set("cx", str(cx))
        circle.set("cy", str(cy))
        circle.set("r", str(self.KNOB_RADIUS))
        circle.set("stroke", self.STROKE_COLOR)
        circle.set("stroke-width", str(self.STROKE_WIDTH))
        circle.set("fill", "transparent")
        
        # Knob indicator
        if not (percent < 0 or percent > 100):
            indicator = ET.SubElement(group, "line")
            indicator.set("x1", str(cx))
            indicator.set("y1", str(cy))
            indicator.set("x2", str(cx))
            indicator.set("y2", str(cy + self.KNOB_RADIUS))
            indicator.set("stroke", self.STROKE_COLOR)
            indicator.set("stroke-width", str(self.STROKE_WIDTH))
            
            # Rotate indicator based on percentage
            angle = self._percent_to_degree(percent)
            indicator.set("transform", f"rotate({angle} {cx} {cy})")
        
        # Label
        if label:
            self._create_text(group, label, cx, cy + self.KNOB_DIAMETER, 
                             text_anchor="middle")
        
        return group
    
    def _create_switch(self, parent: ET.Element, label: str, x: int, y: int, 
                      selected_index: int, options: list) -> ET.Element:
        """Create a vertical switch control"""
        group = ET.SubElement(parent, "g")
        cx = x + self.LED_RADIUS
        current_y = y + self.LED_RADIUS
        y_incr = (self.LED_RADIUS * 3) + 2
        
        # Options (in reverse order to match C# code)
        for i in range(len(options) - 1, -1, -1):
            option = options[i]
            if option:
                fill = self.SWITCH_ACTIVE_COLOR if i == selected_index else "transparent"
                
                # LED circle
                led = ET.SubElement(group, "circle")
                led.set("cx", str(cx))
                led.set("cy", str(current_y))
                led.set("r", str(self.LED_RADIUS))
                led.set("stroke", self.STROKE_COLOR)
                led.set("stroke-width", str(self.STROKE_WIDTH))
                led.set("fill", fill)
                
                # Option label
                label_x = cx + self.LED_RADIUS + 4
                self._create_text(group, option, label_x, current_y - 8)
            
            current_y += y_incr
        
        # Main label
        if label:
            label_x = cx + self.LED_RADIUS + 8
            self._create_text(group, label, label_x, current_y - 8, text_anchor="middle")
        
        return group
    
    def _add_voice_mode_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add voice mode section"""
        group = ET.SubElement(root, "g")
        
        # Octave switch
        self._add_octave_switch(group, program_data, x - 20, self.FIRST_ROW_Y)
        
        # Portamento knob
        portamento_percent = self._percent_from_value(program_data.portamento, 0, 127)
        self._create_knob(group, f"PORTAMENTO\\n{portamento_percent:.1f}%", 
                         x + 180, self.FIRST_ROW_Y, portamento_percent)
        
        # Voice mode depth knob
        vm_depth_percent = self._percent_from_value(program_data.voice_mode_depth, 0, 1023)
        self._create_knob(group, f"VOICE MODE\\nDEPTH\\n{vm_depth_percent:.1f}%", 
                         x + 180, self.FIRST_ROW_Y + self.ROW_SPACING, vm_depth_percent)
        
        # Voice mode type switch
        voice_modes = ["ARP/LATCH", "CHORD", "UNISON", "POLY"]
        self._create_switch(group, "", x + 170, self.FIRST_ROW_Y + self.ROW_SPACING * 2, 
                           int(program_data.voice_mode_type) - 1, voice_modes)
    
    def _add_octave_switch(self, parent: ET.Element, program_data: ProgramData, x: int, y: int):
        """Add octave switch display"""
        group = ET.SubElement(parent, "g")
        cx = x + self.LED_RADIUS
        cy = y + self.LED_RADIUS
        
        for i in range(5):
            offset = i * ((self.LED_RADIUS + 2) * 2)
            fill = self.SWITCH_ACTIVE_COLOR if program_data.octave == i else "transparent"
            
            circle = ET.SubElement(group, "circle")
            circle.set("cx", str(cx + offset))
            circle.set("cy", str(cy))
            circle.set("r", str(self.LED_RADIUS))
            circle.set("stroke", self.STROKE_COLOR)
            circle.set("stroke-width", str(self.STROKE_WIDTH))
            circle.set("fill", fill)
        
        octave_display = program_data.octave - 2
        self._create_text(group, f"OCTAVE\\n({octave_display:+d})", x + 58, y + 40, text_anchor="middle")
    
    def _add_oscillator_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add oscillator section"""
        group = ET.SubElement(root, "g")
        
        # VCO 1
        self._create_text(group, "**VCO 1", x + 315, self.FIRST_ROW_Y - self.HEADER_OFFSET, 
                         font_size="1.6em")
        
        pitch1_percent = self._percent_from_value(program_data.vco1_pitch, 0, 1023)
        self._create_knob(group, f"PITCH\\n{pitch1_percent:.1f}%", 
                         x + 200, self.FIRST_ROW_Y, pitch1_percent)
        
        shape1_percent = self._percent_from_value(program_data.vco1_shape, 0, 1023)
        self._create_knob(group, f"SHAPE\\n{shape1_percent:.1f}%", 
                         x + 355, self.FIRST_ROW_Y, shape1_percent)
        
        # VCO 1 wave and octave switches
        wave_options = ["", "SQR", "TRI", "SAW"]
        self._create_switch(group, "WAVE", x, self.FIRST_ROW_Y, 
                           int(program_data.vco1_wave), wave_options)
        
        octave_options = ["16'", "8'", "4'", "2'"]
        self._create_switch(group, "OCTAVE", x + 100, self.FIRST_ROW_Y, 
                           program_data.vco1_octave, octave_options)
        
        # VCO 2
        second_row_y = self.FIRST_ROW_Y + self.ROW_SPACING
        self._create_text(group, "**VCO 2", x + 315, second_row_y - self.HEADER_OFFSET, 
                         font_size="1.6em")
        
        pitch2_percent = self._percent_from_value(program_data.vco2_pitch, 0, 1023)
        self._create_knob(group, f"PITCH\\n{pitch2_percent:.1f}%", 
                         x + 200, second_row_y, pitch2_percent)
        
        shape2_percent = self._percent_from_value(program_data.vco2_shape, 0, 1023)
        self._create_knob(group, f"SHAPE\\n{shape2_percent:.1f}%", 
                         x + 355, second_row_y, shape2_percent)
        
        cross_mod_percent = self._percent_from_value(program_data.cross_mod_depth, 0, 1023)
        self._create_knob(group, f"CROSS MOD\\nDEPTH\\n{cross_mod_percent:.1f}%", 
                         x + 510, second_row_y, cross_mod_percent)
        
        # VCO 2 wave and octave switches
        self._create_switch(group, "WAVE", x, second_row_y, 
                           int(program_data.vco2_wave), wave_options)
        self._create_switch(group, "OCTAVE", x + 100, second_row_y, 
                           program_data.vco2_octave, octave_options)
        
        # Sync and Ring switches
        sync_options = ["Off", "On"]
        self._create_switch(group, "SYNC", x + 490, self.FIRST_ROW_Y, 
                           1 if program_data.oscillator_sync else 0, sync_options)
        self._create_switch(group, "RING", x + 580, self.FIRST_ROW_Y, 
                           1 if program_data.ring_mod else 0, sync_options)
    
    def _add_mixer_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add mixer section"""
        group = ET.SubElement(root, "g")
        
        self._create_text(group, "**MIXER", x + self.KNOB_RADIUS, 
                         self.FIRST_ROW_Y - self.HEADER_OFFSET, font_size="1.6em")
        
        vco1_percent = self._percent_from_value(program_data.vco1_level, 0, 1023)
        self._create_knob(group, f"VCO 1\\n{vco1_percent:.1f}%", 
                         x, self.FIRST_ROW_Y, vco1_percent)
        
        vco2_percent = self._percent_from_value(program_data.vco2_level, 0, 1023)
        self._create_knob(group, f"VCO 2\\n{vco2_percent:.1f}%", 
                         x, self.FIRST_ROW_Y + self.ROW_SPACING, vco2_percent)
        
        multi_percent = self._percent_from_value(program_data.multi_level, 0, 1023)
        self._create_knob(group, f"MULTI\\n{multi_percent:.1f}%", 
                         x, self.FIRST_ROW_Y + self.ROW_SPACING * 2, multi_percent)
    
    def _add_filter_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add filter section"""
        group = ET.SubElement(root, "g")
        
        self._create_text(group, "**FILTER", x + self.KNOB_RADIUS, 
                         self.FIRST_ROW_Y - self.HEADER_OFFSET, font_size="1.6em")
        
        cutoff_percent = self._percent_from_value(program_data.filter_cutoff, 0, 1023)
        self._create_knob(group, f"CUTOFF\\n{cutoff_percent:.1f}%", 
                         x, self.FIRST_ROW_Y, cutoff_percent)
        
        resonance_percent = self._percent_from_value(program_data.filter_resonance, 0, 1023)
        self._create_knob(group, f"RESONANCE\\n{resonance_percent:.1f}%", 
                         x, self.FIRST_ROW_Y + self.ROW_SPACING, resonance_percent)
        
        # Drive and Key Track switches
        drive_options = ["0%", "50%", "100%"]
        self._create_switch(group, "DRIVE", x - self.KNOB_RADIUS - 5, 
                           self.FIRST_ROW_Y + self.ROW_SPACING * 2, 
                           program_data.filter_cutoff_drive, drive_options)
        
        self._create_switch(group, "KEY\\nTRACK", x + self.KNOB_RADIUS + 5, 
                           self.FIRST_ROW_Y + self.ROW_SPACING * 2, 
                           program_data.filter_cutoff_keyboard_track, drive_options)
    
    def _add_envelope_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add envelope generator section"""
        group = ET.SubElement(root, "g")
        spacing = 120
        
        # Amp EG
        self._create_text(group, "**AMP EG", x + 220, 
                         self.FIRST_ROW_Y - self.HEADER_OFFSET, font_size="1.6em")
        
        amp_attack_percent = self._percent_from_value(program_data.amp_eg_attack, 0, 1023)
        self._create_knob(group, f"ATTACK\\n{amp_attack_percent:.1f}%", 
                         x, self.FIRST_ROW_Y, amp_attack_percent)
        
        amp_decay_percent = self._percent_from_value(program_data.amp_eg_decay, 0, 1023)
        self._create_knob(group, f"DECAY\\n{amp_decay_percent:.1f}%", 
                         x + spacing, self.FIRST_ROW_Y, amp_decay_percent)
        
        amp_sustain_percent = self._percent_from_value(program_data.amp_eg_sustain, 0, 1023)
        self._create_knob(group, f"SUSTAIN\\n{amp_sustain_percent:.1f}%", 
                         x + spacing * 2, self.FIRST_ROW_Y, amp_sustain_percent)
        
        amp_release_percent = self._percent_from_value(program_data.amp_eg_release, 0, 1023)
        self._create_knob(group, f"RELEASE\\n{amp_release_percent:.1f}%", 
                         x + spacing * 3, self.FIRST_ROW_Y, amp_release_percent)
        
        # EG
        second_row_y = self.FIRST_ROW_Y + self.ROW_SPACING
        self._create_text(group, "**EG", x + 220, second_row_y - self.HEADER_OFFSET, font_size="1.6em")
        
        eg_attack_percent = self._percent_from_value(program_data.eg_attack, 0, 1023)
        self._create_knob(group, f"ATTACK\\n{eg_attack_percent:.1f}%", 
                         x, second_row_y, eg_attack_percent)
        
        eg_decay_percent = self._percent_from_value(program_data.eg_decay, 0, 1023)
        self._create_knob(group, f"DECAY\\n{eg_decay_percent:.1f}%", 
                         x + spacing, second_row_y, eg_decay_percent)
        
        eg_int_percent = self._percent_from_value(program_data.eg_int, 0, 1023)
        self._create_knob(group, f"EG INT\\n{eg_int_percent:.1f}%", 
                         x + spacing * 2, second_row_y, eg_int_percent)
        
        # EG Target switch
        eg_targets = ["Cutoff", "Pitch 2", "Pitch"]
        self._create_switch(group, "TARGET", x + spacing * 3, second_row_y, 
                           int(program_data.eg_target), eg_targets)
        
        # LFO
        third_row_y = self.FIRST_ROW_Y + self.ROW_SPACING * 2 + 20
        self._create_text(group, "**LFO", x + 220, third_row_y - self.HEADER_OFFSET, font_size="1.6em")
        
        lfo_wave_options = ["SQR", "TRI", "SAW"]
        self._create_switch(group, "WAVE", x, third_row_y, 
                           int(program_data.lfo_wave), lfo_wave_options)
        
        lfo_mode_options = ["1-Shot", "Normal", "BPM"]
        self._create_switch(group, "MODE", x + 90, third_row_y, 
                           int(program_data.lfo_mode), lfo_mode_options)
        
        lfo_rate_percent = self._percent_from_value(program_data.lfo_rate, 0, 1023)
        self._create_knob(group, f"RATE\\n{lfo_rate_percent:.1f}%", 
                         x + 200, third_row_y, lfo_rate_percent)
        
        lfo_int_percent = self._percent_from_value(program_data.lfo_int, 0, 1023)
        self._create_knob(group, f"INT\\n{lfo_int_percent:.1f}%", 
                         x + 300, third_row_y, lfo_int_percent)
        
        lfo_targets = ["Cutoff", "Shape", "Pitch"]
        self._create_switch(group, "TARGET", x + 400, third_row_y, 
                           int(program_data.lfo_target), lfo_targets)
    
    def _add_effects_section(self, root: ET.Element, program_data: ProgramData, x: int):
        """Add effects section"""
        group = ET.SubElement(root, "g")
        
        self._create_text(group, "**EFFECTS", x + 120, 
                         self.FIRST_ROW_Y - self.HEADER_OFFSET, font_size="1.6em")
        
        # Mod FX
        mod_fx_status = "On" if program_data.mod_fx_on_off else "Off"
        mod_fx_type = program_data.mod_fx_type.name if hasattr(program_data.mod_fx_type, 'name') else str(program_data.mod_fx_type)
        self._create_text(group, f"MOD FX ({mod_fx_status}): {mod_fx_type}", 
                         x, self.FIRST_ROW_Y, font_size="1.6em")
        
        mod_fx_time_percent = self._percent_from_value(program_data.mod_fx_time, 0, 1023)
        self._create_knob(group, f"MOD FX\\nTIME\\n{mod_fx_time_percent:.1f}%", 
                         x + 20, self.FIRST_ROW_Y + 40, mod_fx_time_percent)
        
        mod_fx_depth_percent = self._percent_from_value(program_data.mod_fx_depth, 0, 1023)
        self._create_knob(group, f"MOD FX\\nDEPTH\\n{mod_fx_depth_percent:.1f}%", 
                         x + 140, self.FIRST_ROW_Y + 40, mod_fx_depth_percent)
        
        # Reverb FX
        second_row_y = self.FIRST_ROW_Y + self.ROW_SPACING
        reverb_status = "On" if program_data.reverb_on_off else "Off"
        reverb_type = program_data.reverb_sub_type.name if hasattr(program_data.reverb_sub_type, 'name') else str(program_data.reverb_sub_type)
        self._create_text(group, f"REVERB FX ({reverb_status}): {reverb_type}", 
                         x, second_row_y, font_size="1.6em")
        
        reverb_time_percent = self._percent_from_value(program_data.reverb_time, 0, 1023)
        self._create_knob(group, f"REVERB FX\\nTIME\\n{reverb_time_percent:.1f}%", 
                         x + 20, second_row_y + 40, reverb_time_percent)
        
        reverb_depth_percent = self._percent_from_value(program_data.reverb_depth, 0, 1023)
        self._create_knob(group, f"REVERB FX\\nDEPTH\\n{reverb_depth_percent:.1f}%", 
                         x + 140, second_row_y + 40, reverb_depth_percent)
        
        # Delay FX
        third_row_y = self.FIRST_ROW_Y + self.ROW_SPACING * 2
        delay_status = "On" if program_data.delay_on_off else "Off"
        delay_type = program_data.delay_sub_type.name if hasattr(program_data.delay_sub_type, 'name') else str(program_data.delay_sub_type)
        self._create_text(group, f"DELAY FX ({delay_status}): {delay_type}", 
                         x, third_row_y, font_size="1.6em")
        
        delay_time_percent = self._percent_from_value(program_data.delay_time, 0, 1023)
        self._create_knob(group, f"DELAY FX\\nTIME\\n{delay_time_percent:.1f}%", 
                         x + 20, third_row_y + 40, delay_time_percent)
        
        delay_depth_percent = self._percent_from_value(program_data.delay_depth, 0, 1023)
        self._create_knob(group, f"DELAY FX\\nDEPTH\\n{delay_depth_percent:.1f}%", 
                         x + 140, third_row_y + 40, delay_depth_percent)
    
    def _percent_from_value(self, value: int, min_val: int, max_val: int) -> float:
        """Convert value to percentage"""
        if max_val == min_val:
            return 0.0
        floored_value = value - min_val
        range_val = max_val - min_val
        percent_factor = range_val / 100.0
        return floored_value / percent_factor
    
    def _percent_to_degree(self, percent: float) -> float:
        """Convert percentage to knob rotation degrees"""
        percent = max(0, min(100, percent))
        
        # Knob rotation range (matches C# implementation)
        min_angle = 35
        max_angle = 360 - min_angle
        steps = (max_angle - min_angle) / 100.0
        result = min_angle + (steps * percent)
        return round(result, 2)
    
    def _prettify_xml(self, elem: ET.Element) -> str:
        """Return a pretty-printed XML string"""
        rough_string = ET.tostring(elem, 'unicode')
        reparsed = minidom.parseString(rough_string)
        pretty = reparsed.toprettyxml(indent="  ")
        
        # Remove extra blank lines
        lines = [line for line in pretty.split('\\n') if line.strip()]
        return '\\n'.join(lines)