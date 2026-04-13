const KNOWLEDGE_BASE = {
  compression: [
    {
      title: "Compression Fundamentals",
      summary: "Compression is an automatic gain-riding device that reduces peaks dynamically. Beyond level control, it shapes tone and character. Understanding it requires developing taste through comparative listening.",
      techniques: ["Automatic Gain Riding — threshold, ratio, attack, release", "Peak Management — tuck peaks to raise quieter details", "Tonal Shaping — gentle preserves dynamics, heavy reshapes tone", "Vision-First — establish desired character before touching controls", "A/B Assessment — bypass to evaluate impact on transients and sustain"]
    },
    {
      title: "Advanced Compressor Controls",
      summary: "Soft Knee, Look Ahead, sidechain EQ, and dry/wet ratio are powerful tools for precise dynamic control. Understanding them goes beyond default settings.",
      techniques: ["Soft Knee — gradual compression onset for transparent control", "Look Ahead — prevents transient distortion by anticipating peaks", "Sidechain EQ — filter the detection signal to ignore low-end pumping", "Dry/Wet Parallel — blend compressed and dry for New York compression"]
    },
    {
      title: "Compression Topology",
      summary: "Build a personal library of familiar compressors whose sonic characteristics you understand deeply. Cross-source testing reveals each compressor's true character.",
      techniques: ["Reference Library — master 3-4 compressors deeply rather than collecting many", "Cross-Source Testing — same compressor on different sources reveals true character"]
    },
  ],
  eq: [
    {
      title: "EQ Strategy and Philosophy",
      summary: "EQ is corrective and creative. Subtractive EQ first removes problematic frequencies before additive EQ enhances. Every cut or boost affects phase and tone character.",
      techniques: ["Subtractive First — cut problems before boosting", "High-pass filtering — remove low-end buildup on non-bass elements", "Frequency relationships — cutting one element creates space for another", "Dynamic EQ — frequency-specific compression for context-sensitive control"]
    },
  ],
  reverb: [
    {
      title: "Creating Space with Reverbs",
      summary: "Reverb creates depth and dimension. Pre-delay separates the source from its room, preserving clarity while adding space. Different reverb types serve different spatial purposes.",
      techniques: ["Pre-delay — 15-30ms separates source from tail, preserves intelligibility", "Room reverb — short decay for cohesion without washing out", "Hall reverb — long decay for grandeur, filter lows to avoid mud", "Reverb as mix glue — same space on multiple elements creates cohesion"]
    },
  ],
  dynamics: [
    {
      title: "Parallel Compression on Drums",
      summary: "Parallel compression blends a heavily compressed signal with the dry signal to add punch and density while preserving transient attack.",
      techniques: ["New York compression — send drums to aux, compress aggressively, blend back", "Attack fast on parallel — lets transients through on dry, adds body on compressed", "Ratio 10:1+ on parallel bus — crush it, the dry signal preserves the feel"]
    },
    {
      title: "Advanced Parallel Compression",
      summary: "Multiple parallel processing layers can address different aspects of the sound simultaneously — transient enhancement, density, and harmonic saturation.",
      techniques: ["Transient shaper in parallel — enhance attack without affecting sustain", "Saturation in parallel — add harmonics without committing to full saturation"]
    },
  ],
  routing: [
    {
      title: "Mix Bus Processing",
      summary: "Mix bus compression and processing should be applied early to make mix decisions with the glue in place. Light touch — the mix bus enhances, not corrects.",
      techniques: ["Low ratio on bus — 1.5:1 to 2:1 maximum for transparency", "Slow attack — lets transients through before compressing", "Bus glue early — reference against bus compression throughout mixing"]
    },
  ],
  mix: [
    {
      title: "Balancing Techniques",
      summary: "Balance is the foundation of all mixing. Relative levels between elements determine clarity and emotional impact more than any processing.",
      techniques: ["Start in mono — forces balance decisions without stereo masking", "Volume before processing — get the balance right before adding EQ or compression", "Reference constantly — compare against commercial tracks at matched levels"]
    },
  ],
};

export default KNOWLEDGE_BASE;
