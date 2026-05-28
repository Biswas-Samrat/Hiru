const Setting = require('../models/Setting');

const DEFAULT_SETTINGS = {
  onlineOrderingEnabled: true,
  onlineBookingEnabled: true,
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

  return {
    ...DEFAULT_SETTINGS,
    ...(settings.value || {}),
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
