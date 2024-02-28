import { useRouter } from 'next/router';
import xml2js from 'xml2js';


// Define your API route handler
export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const data = await fetch(`https://sungil-h.goesn.kr/sungil-h/na/ntt/selectRssFeed.do?mi=19912&bbsId=15522`);
        const xml = await data.text();

        const result = await parseXML(xml);

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function parseXML(xmlString) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlString, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const items = result.rss.channel[0].item;
                const jsonObjectArray = items.map(item => ({
                    title: item.title[0],
                    url: item.link[0],
                    reg_date: item.pubDate[0]
                }));
                resolve(jsonObjectArray);
            }
        });
    });
}
