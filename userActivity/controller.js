import { activityPopulateField, activitySelectField } from './constant.js';
import { UserActivity } from './model.js';
import { transformAndCleanContentField } from './utils.js';

const getUserActivity = async (req, res) => {
    try {
        let activity = await UserActivity.findOne({
            userId: req.userId,
        })
            .select(activitySelectField)
            .populate(activityPopulateField);
        activity = transformAndCleanContentField(activity);
        res.status(200).json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { getUserActivity };
