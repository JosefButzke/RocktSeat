import { isBefore, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetups from '../models/Meetups';
import User from '../models/User';

class MeetupsController {
  async index(req, res) {
    const { date, page } = req.query;

    const searchDate = date;

    if (date === '') {
      const meetups = await Meetups.findAll({
        where: { organizer: req.userId },
      });
      return res.json(meetups);
    }

    const meetups = await Meetups.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        { model: User, as: 'organizerId', attributes: ['nome', 'email'] },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const { title, description, location, date, image } = req.body;

    if (isBefore(date, new Date()))
      return res.status(400).json('Past dates not permited.');

    const meetup = await Meetups.create({
      title,
      description,
      location,
      date,
      image,
      organizer: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await Meetups.findOne({
      where: { id: req.params.id, organizer: req.userId },
    });

    if (!meetup.editable)
      return res.status(400).json('Not permited edit past meetups.');

    await meetup.update(req.body);
    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetups.findOne({
      where: { id: req.params.id, organizer: req.userId },
    });

    if (meetup.editable)
      return res.status(400).json('Not permited edit meetups not realized.');

    await meetup.destroy();
    return res.json();
  }
}

export default new MeetupsController();
