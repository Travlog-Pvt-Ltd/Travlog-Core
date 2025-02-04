import { asyncControllerHandler } from '../common/middleware.js';
import { activityPopulateField, activitySelectField } from './constant.js';
import { UserActivity } from './model.js';
import { transformAndCleanContentField } from './utils.js';

const getUserActivity = asyncControllerHandler(async (req, res) => {
    let activity = await UserActivity.findOne({
        userId: req.userId,
    })
        .select(activitySelectField)
        .populate(activityPopulateField);
    activity = transformAndCleanContentField(activity);
    res.status(200).json(activity);
});

export { getUserActivity };
