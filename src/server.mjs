import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { rhsaNumbers, executeCommandOnServer, updateSSHConfig  } from './serv.js';
import { Client } from 'ssh2';
import fetch from 'node-fetch';
import { createServer } from 'http';
import WebSocket from 'ws';
import { product } from './serv.js';
import { log } from 'console';

const app = express();
app.use(express.json());
const server = createServer(app);
const wss = new WebSocket.Server({ server });
app.use(cors());


let clientSocket = null;
let collection;

let newConfig = '';

app.post('/update-ssh-config', (req, res) => {
    newConfig = req.body; // Assuming the request body contains host, username, and password properties
    updateSSHConfig(newConfig);
    res.json({ message: 'SSH Config updated successfully' });
});

let extractedVersion;

async function connectToMongoDB() {
    try {
        const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/RHSA';
        const client = new MongoClient(url);
       const collectionName = extractedVersion.toString();
        // Wait for MongoDB container to initialize for 5 seconds (adjust as needed)
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await client.connect();
        console.log('Connected to MongoDB successfully!');
        const db = client.db('RHSA');
        collection = db.collection(collectionName);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}




let sharedData = null; // Variable to store processed data

app.all('/api', (req, res) => {
    if (req.method === 'GET') {
        if (sharedData) {
            // If data is available, send it in the response
            res.json(sharedData);
        } else {
            res.status(404).send('Data not available');
        }

    } else if (req.method === 'POST') {
        if(newConfig.selectedButton === 'RHEL'){
        // Handle POST request
        const requestData = req.body;
        const robocorp_numbers = Object.values(requestData).flat();
        const robocorp_set = new Set(robocorp_numbers);
        const robocorp_array = [...robocorp_set];

        const sshRhsasSet = new Set(rhsaNumbers);
        console.log('SSH RHSA numbers Set:', sshRhsasSet);

        sharedData = robocorp_array.filter((item) => !sshRhsasSet.has(item));
        console.log('Left out RHSA numbers in robocorp response:', sharedData);

        if (clientSocket) {
            clientSocket.send(JSON.stringify({ type: 'data-update', data: sharedData }));
            clientSocket = null; // Reset the client socket after notifying
        }
       

        res.json(sharedData);
    }
    else if(newConfig.selectedButton === 'SUSE'){
        // Handle POST request
        const requestData = req.body;
        res.json(requestData);

    } }
});
// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');
    clientSocket = ws;
});




app.get('/server', async (req, res) => {
    console.log('/server' , product);
 
    console.log('Received request to /server',product);
    const command = 'cat /etc/redhat-release';

    try {
        const output = await executeCommandOnServer(command);
        console.log('Command Output:', output);
        res.json({ output: output });
    } catch (error) {
        console.error('Error in /server endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


function uipath(version){
    let selectedButton = newConfig.selectedButton;
app.get('/api/uipath', (req, res) => {
    res.json({ selectedButton:selectedButton , version: version,  });
    console.log({selectedButton: selectedButton, version : version});
  });
  app.listen(() => {
    console.log(`Server is running on port 3001`);
  });
} 
+


app.get('/rhea/:rheaNumber', async (req, res) => {
    const rheaNumber = req.params.rheaNumber;

    try {
       
        const response = await fetch(`https://access.redhat.com/hydra/rest/securitydata/cvrf/${rheaNumber}.json`);
       
        if (!response.ok) {
            const errorMessage = `HTTP error! ${rheaNumber} Status: ${response.status}\nResponse: ${await response}`;
            throw new Error(errorMessage);
        }


        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/data', async (req, res) => {
    try {
        console.log('SSH doremon RHSA numbers:', rhsaNumbers);
        const mongoResponse = await collection.find({}, { projection: { _id: 0, Advisory: 1 } }).toArray();
     
        console.log('Data retrieved from MongoDB collection:', mongoResponse);

        const modifiedResponse = mongoResponse.map(item => {
            
            item.Advisory = item.Advisory.replace(/^Advisory/, '');
            return item;
        });

        console.log('Modified Data after  removing advisory :', modifiedResponse);

        const sshRhsasSet = new Set(rhsaNumbers);
        console.log('SSH RHSA numbers Set:', sshRhsasSet);
        const leftOutMongoRHSA = mongoResponse.filter(({Advisory}) => !sshRhsasSet.has(Advisory));
        console.log('Left out RHSA numbers in MongoDB response:', leftOutMongoRHSA);
        res.json(leftOutMongoRHSA);


    } catch (err) {
        console.error('Error retrieving data:', err);
        // Handle errors appropriately, sending an error response if needed
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/trigger-robocorp-process', async (req, res) => {
    try {
        const response = await fetch('https://cloud.robocorp.com/api/v1/workspaces/55fc041e-a88f-41bd-87d8-2eeb7ca8a89c/processes/031eea37-dbb2-464a-bf46-6a1d50ffafd5/process-runs-integrations?token=31Anlup6vWOFO3ErpcS5YPkuWPtj0jCFgQuW1jyFG5c8D0LQKv54LPhSQsGpzJNDWLzp2cPEolYTIVLHSL4HwweiyCYu76qACzsIil1ectVQPi6cpT4p8eHWVejwJenI7FEY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'RC-WSKEY 31Anlup6vWOFO3ErpcS5YPkuWPtj0jCFgQuW1jyFG5c8D0LQKv54LPhSQsGpzJNDWLzp2cPEolYTIVLHSL4HwweiyCYu76qACzsIil1ectVQPi6cpT4p8eHWVejwJenI7FEY'
            },
            body: JSON.stringify({
                // Your JSON payload here
            })
        });

        if (response.ok) {
            const responseData = await response.json();
            res.json(responseData);
            console.log('Robocorp process triggered successfully:', responseData);
          

        } else {
            console.error('Error:', response.status, response.statusText);
            res.status(response.status).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 let release = '';
 let username = '';


app.use(cors());
app.post('/ssh', (req, res) => {
    const conn = new Client();

    conn.on('ready', () => {
        // Execute the first command: cat /etc/redhat-release
        if(newConfig.selectedButton === 'RHEL'){
                release = 'cat /etc/redhat-release';
                username = 'hostname';
        }
        else if(newConfig.selectedButton === 'SUSE'){
                release = 'cat /etc/os-release';
                username = 'hostname';
        }
        conn.exec(release, (err, stream) => {
            if (err) throw err;
            let version = '';
            let regex = '';
            let matches = '';

            stream.on('close', (code, signal) => {
                if(newConfig.selectedButton === 'RHEL'){
                // Extract double integer from version string using regex
                 regex = /\d+\.\d+/;
                 matches = version.match(regex);
                }

                else if(newConfig.selectedButton === 'SUSE'){
                    // Extract double integer from version string using regex

                    const releaseInfoMatch = version.match(/SUSE Linux Enterprise Server(.*)/);
                    const releaseInfo = releaseInfoMatch ? releaseInfoMatch[1].trim() : '';
                    extractedVersion = releaseInfo;
                }


                if (matches && matches.length > 0) {
                    extractedVersion = parseFloat(matches[0]); // Convert to floating-point number if needed
                }

                console.log('Extracted version:', extractedVersion);

                // Execute the second command: hostname
                conn.exec(username, (err, hostnameStream) => {
                    if (err) throw err;
                    let hostname = '';

                    hostnameStream.on('close', (code, signal) => {
                        conn.end();
                        res.json({ version, hostname });
                        uipath(extractedVersion);
                        connectToMongoDB();
                    }).on('data', data => {
                        hostname += data.toString();
                    }).stderr.on('data', data => {
                        console.error('Error: ' + data);
                    });
                });
            }).on('data', data => {
                if(newConfig.selectedButton === 'RHEL')
                version += data.toString();
                else if(newConfig.selectedButton === 'SUSE'){
                    const osReleaseOutput = data.toString();
                const prettyNameMatch = osReleaseOutput.match(/PRETTY_NAME="(.*?)"/);
                const prettyName = prettyNameMatch ? prettyNameMatch[1] : '';
                version += prettyName;
                }
            }).stderr.on('data', data => {
                console.error('Error: ' + data);
            });
        });
    }).connect(newConfig);
});








server.listen(3002, () => {
    console.log('WebSocket server is running on port 3002');
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});