import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Subscription from '../models/Subscription';
import Meetups from '../models/Meetups';

import Notification from '../schemas/Notification';
import User from '../models/User';

import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const meetups = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: [],
      include: [
        {
          model: Meetups,
          attributes: ['title', 'date'],
          order: ['date'],
        },
      ],
    });
    res.json(meetups);
  }

  async store(req, res) {
    const meetup = await Meetups.findByPk(req.params.id);

    if (meetup.organizer === req.userId)
      return res
        .status(401)
        .json('Dont possible participate of meetup, you are the organizer.');

    if (!meetup.editable)
      return res.status(401).json('Dont possible participate of past meetup.');

    const checkDoubleSubscription = await Subscription.findOne({
      where: { meetup_id: req.params.id, user_id: req.userId },
    });

    if (checkDoubleSubscription)
      return res
        .status(401)
        .json('Dont possible participate twice times of meetup.');

    const checkTimeOfMeetup = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        { model: Meetups, required: true, where: { date: meetup.date } },
      ],
    });

    if (checkTimeOfMeetup)
      return res.status(401).json('Conflict with date of meetups.');

    const sub = await Subscription.create({
      meetup_id: req.params.id,
      user_id: req.userId,
    });

    /**
     * Notification new subscriptions
     */

    const user = await User.findByPk(req.userId);
    await Notification.create({
      content: `New subscription de ${user.nome} no meetup ${meetup.title}.`,
      user: req.userId,
    });

    /**
     * Send mail new subscriptions
     */

    await Mail.sendMail({
      to: `${user.nome} <${user.email}>`,
      subject: 'Notificação de inscrição',
      template: 'notification',
      context: {
        meetupName: meetup.name,
        user: user.nome,
        date: format(meetup.date, "'dia' dd 'de'MMMM', às 'H:mm 'h'", {
          locale: pt,
        }),
      },
    });

    return res.json(sub);
  }
}

export default new SubscriptionController();
