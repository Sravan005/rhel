import { Client } from 'ssh2';

const conn = new Client();
let sshConfig = {
  host: '',
  username: '',
  password: '',
  readyTimeout: 6000
};
export let product = '';
export function updateSSHConfig(newConfig) {

  sshConfig = newConfig;
  product = sshConfig.selectedButton;
  console.log(product);
  initiateSSHConnection();
}



export const rhsaNumbers = []; // Export the array to be used in other files

export function executeCommandOnServer(command) {
  return new Promise((resolve, reject) => {
      conn.on('ready', () => {
          conn.exec(command, (err, stream) => {
              if (err) {
                  conn.end();
                  reject(err);
                  return;
              }

              let output = '';

              stream.on('data', (data) => {
                  output += data.toString();
              }).on('close', (code, signal) => {
                  conn.end();
                  resolve(output);
              }).stderr.on('data', (data) => {
                  console.log('STDERR: ' + data);
              });
          });
      }).on('error', (err) => {
          conn.end();
          reject(err);
      }).connect(sshConfig);
  });
}




export function initiateSSHConnection() {
  conn.on('ready', function() {
    console.log('Connected via SSH');

    if(sshConfig.selectedButton === 'RHEL'){
    conn.exec('yum updateinfo list security --installed', function(err, stream) {
      if (err) throw err;
      console.log(sshConfig);
  
      stream.on('stderr', function(data) {
        console.error('STDERR: ' + data);
    });
      
        stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        console.log('Extracted RHSA Numbers:', rhsaNumbers); // Print extracted RHSA numbers
        conn.end();
      }).on('data', function(data) {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          const match = line.match(/RHSA-\d+:\d+/);
          if (match) {
            rhsaNumbers.push(match[0]); // Extract and store RHSA numbers
          }
        });
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });
    }); }
  })
  
  conn.on('error', function(err) {
    console.error('SSH Connection Error:', err);
    // Handle SSH connection errors here
  });
  
  // Connect only if sshConfig is not empty
  if (sshConfig.host && sshConfig.username && sshConfig.password) {
    conn.connect(sshConfig);
  }
  }
  
