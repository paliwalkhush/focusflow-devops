# FocusFlow Pomodoro — Automated Deployment

Automates provisioning, configuration, and deployment of the **FocusFlow Pomodoro** app
(React frontend + Node/Express backend + MongoDB) to AWS EC2 using **Terraform**, **Ansible**,
and **Docker**.

## 1. Tool Purpose

| Tool      | Purpose                                                          |
|-----------|-------------------------------------------------------------------|
| Terraform | Creates the AWS EC2 instance + security group.                   |
| Ansible   | Installs Docker/Compose on the server and deploys the containers. |
| Docker    | Packages and runs the frontend, backend, and MongoDB.            |
| GitHub    | Stores project files and version history.                        |

## 2. Workflow

```
Laptop -> Terraform -> AWS EC2 -> Ansible -> Docker Compose (frontend + backend + mongo) -> Browser
```

Three containers run on the single EC2 instance:
- **frontend** — nginx serving the built React app on port 80, reverse-proxying `/api/*` to backend
- **backend** — Node/Express API on port 5000 (internal only, not exposed to the internet)
- **mongo** — MongoDB with a persistent Docker volume

## 3. Step-by-Step

**Step 1 — Fix required before deploying**
The frontend originally called the API at `http://localhost:5000/api`, which only works on
your own laptop. This has already been patched in `frontend/src/pages/*.js` to use the relative
path `/api`, so it works through the nginx reverse proxy in production. If you pull fresh
changes from your repo later, keep this in mind.

**Step 2 — Create AWS key pair**
In AWS EC2, create a key pair `focusflow-key` and save `focusflow-key.pem`. Never commit this
to GitHub.

**Step 3 — Configure AWS CLI**
```
aws configure
```

**Step 4 — Review Terraform variables**
Open `terraform/variables.tf` and set `key_name` to your key pair name. Double-check `ami_id`
against the current Ubuntu 22.04 AMI for your chosen region (AMI IDs change over time).

**Step 5 — Provision the server**
```
cd terraform
terraform init
terraform validate
terraform plan
terraform apply
```
Copy the `instance_public_ip` output.

**Step 6 — Point Ansible at the server**
Edit `ansible/inventory.ini` and replace `YOUR_EC2_IP` with the IP from Step 5.

**Step 7 — Test connectivity**
```
cd ansible
ansible all -i inventory.ini -m ping
```
Expected: `pong`.

**Step 8 — Deploy**
```
ansible-playbook -i inventory.ini deploy.yml
```
This installs Docker + the Compose plugin, copies the project (excluding `node_modules` and
`.git`), and runs `docker compose up -d --build`.

**Step 9 — Open the app**
Visit `http://YOUR_EC2_PUBLIC_IP` in a browser. FocusFlow Pomodoro should load, and the
dashboard/tasks/analytics pages should successfully call the API through the proxy.

**Step 10 — Push to GitHub**
```
git add .
git commit -m "Add Terraform/Ansible/Docker deployment"
git push
```
Add `*.pem` and `terraform/.terraform/`, `terraform/*.tfstate*` to `.gitignore` (see below) so
secrets and state files never get committed.

**Step 11 — Cleanup**
```
cd terraform
terraform destroy
```

## 4. .gitignore additions
```
*.pem
terraform/.terraform/
terraform/*.tfstate
terraform/*.tfstate.backup
node_modules/
```

## 5. Viva-style quick answers

| Question | Answer |
|---|---|
| DevOps | Combines development and operations with automation. |
| Terraform | Creates infrastructure. |
| Ansible | Configures infrastructure. |
| Docker | Runs the application in containers. |
| IaC | Infrastructure managed using code. |
| Image vs Container | Image = blueprint; Container = running instance. |
| Why 3 containers instead of 1 | Separation of concerns — frontend, API, and database scale/restart independently and mirror the app's existing frontend/backend split. |

**Terraform = CREATE | Ansible = CONFIGURE | Docker = RUN**
