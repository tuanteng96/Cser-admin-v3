import axios from "axios";

export const getCall = (req, res) => {
    res.send("Router");
}

export const postCall = async(req, res) => {
    const { api_key, extension, phone } = req.body;
    try {
        const result = await axios.post("https://crm.pavietnam.vn/api/callNow.php", {
            api_key: "5a6cb8ac5eaa1837ca4c99991d28a61c",
            extension: "102",
            phone: phone,
        });

        if (!result.data) {
            res.status(200).json({ data: true });
        } else {
            res.status(200).json({ data: result.data });
        }

    } catch (error) {
        res.status(500).json({ error: error })
    }
}