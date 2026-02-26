
// créer un avis note
exports.createAvisNote = async (req, res) => {
  try {
    const avisNoteCreated = await avisNote.create(req.body);
    res.status(201).json(avisNoteCreated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les avis notes
exports.getAllAvisNotes = async (req, res) => {
    const { boutique, utilisateur } = req.query;
    const filter = {};
    if (boutique) filter.boutique = boutique;
    if (utilisateur) filter.utilisateur = utilisateur;
  try {
    const avisNotes = await avisNote.find(filter).populate("utilisateur", "nom").populate("boutique", "nom");
    res.json(avisNotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un avis note par ID
exports.getAvisNoteById = async (req, res) => {
  try {
    const avisNote = await avisNote.findById(req.params.id).populate("utilisateur", "nom").populate("boutique", "nom");
    if (!avisNote) return res.status(404).json({ error: "Avis note non trouvé" });
    res.json(avisNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un avis note
exports.updateAvisNote = async (req, res) => {
  try {
    const avisNote = await avisNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!avisNote) return res.status(404).json({ error: "Avis note non trouvé" });
    res.json(avisNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un avis note
exports.deleteAvisNote = async (req, res) => {
  try {
    const avisNote = await avisNote.findByIdAndDelete(req.params.id);
    if (!avisNote) return res.status(404).json({ error: "Avis note non trouvé" });
    res.json({ message: "Avis note supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};