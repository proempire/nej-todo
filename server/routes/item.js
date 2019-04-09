import { Router } from 'express';

const router = Router();

router.get('items', async (req, res) => {
    const items = await req.context.models.Item.find();

    return res.send(items);
});

router.post('items/add', async (req, res) => {
    const item = await req.context.models.Item.findById(
        req.body.id
    );

    let result = null;
    if (item) {
        result = item.update({ $inc: { volume: 1 } }).exec();
    }

    return res.send(result);
});

router.post('items/delete', async (req, res) => {
    const item = await req.context.models.Item.findById(
        req.body.id
    );

    let result = null;
    if (item) {
        result = await item.remove();
    }

    return res.send(item);
});

router.post('items/new', async (req, res) => {
    const item = await req.context.models.Item.create({
        name: req.body.name
    });

    return res.send(item);
});