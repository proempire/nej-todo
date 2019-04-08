import { Router } from 'express';

const router = Router();

router.get('items', async (req, res) => {
    const items = await req.context.models.Item.find();
    return res.send(items);
});

router.post('items/add', async (req, res) => {
    const items = await req.context.models.Item.find();
    return res.send(items);
});

router.post('items/delete', async (req, res) => {
    const items = await req.context.models.Item.find();
    return res.send(items);
});

router.post('items/new', async (req, res) => {
    const items = await req.context.models.Item.find();
    return res.send(items);
});