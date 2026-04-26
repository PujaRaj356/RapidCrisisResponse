// using Google Gemini API Mock to fulfill requirement for now
// In real app, we'd use @google/genai but to keep setup reliable without API keys, we mock the format.

const classifyIncident = async (req, res) => {
  try {
    const { description } = req.body;

    // Simulated API Call to Gemini
    setTimeout(() => {
      // Very basic keyword heuristic acting as an "AI" for the mock response
      let type = 'Other';
      let severity = 'Medium';
      let steps = 'Please remain calm and wait for staff response.';

      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('fire') || lowerDesc.includes('smoke')) {
        type = 'Fire';
        severity = 'Critical';
        steps = 'Evacuate immediately using the stairs. Do not use the elevator. Pull nearest fire alarm.';
      } else if (lowerDesc.includes('heart') || lowerDesc.includes('blood') || lowerDesc.includes('unconscious')) {
        type = 'Medical';
        severity = 'High';
        steps = 'Stay with the person. Send someone to meet the ambulance. Do not move them unless in immediate danger.';
      } else if (lowerDesc.includes('gun') || lowerDesc.includes('fight') || lowerDesc.includes('threat')) {
        type = 'Security Threat';
        severity = 'Critical';
        steps = 'Lock doors, turn off lights, and stay out of sight. Do not confront the threat.';
      }

      res.json({
        type,
        severity,
        suggestions: steps,
        summary: `Possible ${type} reported. Priority: ${severity}.`
      });
    }, 1500); // 1.5s simulated loading

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { classifyIncident };
