const Setting = require('../models/Setting');

const DEFAULT_SKILLS = [
  { id: 'willingness', label: 'WILLINGNESS TO LEARN', percentage: 90 },
  { id: 'passion', label: 'GENUINE PASSION', percentage: 80 },
  { id: 'organisation', label: 'ORGANISATION', percentage: 75 },
  { id: 'creativity', label: 'CREATIVITY', percentage: 85 },
  { id: 'time_management', label: 'TIME MANAGEMENT', percentage: 75 },
  { id: 'teamwork', label: 'TEAMWORK', percentage: 95 },
];

const DEFAULT_SETTINGS = {
  onlineOrderingEnabled: true,
  onlineBookingEnabled: true,
  skills: DEFAULT_SKILLS,
};

const SETTINGS_KEY = 'restaurantControls';

const getOrCreateSettings = async () => {
  let settings = await Setting.findOne({ key: SETTINGS_KEY });

  if (!settings) {
    settings = new Setting({
      key: SETTINGS_KEY,
      value: DEFAULT_SETTINGS,
    });
    await settings.save();
  }

  const value = settings.value || {};
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    skills: value.skills && value.skills.length > 0 ? value.skills : DEFAULT_SKILLS,
  };
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res, io) => {
  try {
    const current = await getOrCreateSettings();
    const next = {
      ...current,
      onlineOrderingEnabled: Object.prototype.hasOwnProperty.call(req.body, 'onlineOrderingEnabled')
        ? Boolean(req.body.onlineOrderingEnabled)
        : current.onlineOrderingEnabled,
      onlineBookingEnabled: Object.prototype.hasOwnProperty.call(req.body, 'onlineBookingEnabled')
        ? Boolean(req.body.onlineBookingEnabled)
        : current.onlineBookingEnabled,
      skills: Object.prototype.hasOwnProperty.call(req.body, 'skills')
        ? req.body.skills
        : current.skills,
    };

    let settings = await Setting.findOne({ key: SETTINGS_KEY });
    if (!settings) {
      settings = new Setting({ key: SETTINGS_KEY, value: next });
    } else {
      settings.value = next;
    }
    await settings.save();

    io.emit('settingsUpdate', next);
    res.json(next);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrCreateSettings = getOrCreateSettings;
