required_plugins = %w( vagrant-hostsupdater vagrant-vbguest vagrant-triggers vagrant-vmware-fusion )
required_plugins.each do |plugin|
  system "vagrant plugin install #{plugin}" unless Vagrant.has_plugin? plugin
end

require 'yaml'

ENV['VAGRANT_DEFAULT_PROVIDER'] = "vmware_fusion"

ENVIRONMENT = "local"

settings = YAML.load_file "envs/#{ENVIRONMENT}/settings.yml"
settings["env"] = ENVIRONMENT

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
Vagrant.require_version ">= 1.7.0"
VAGRANTFILE_API_VERSION = "2"

# Config for virtual machines.
VM_VARS = {
  box: "geerlingguy/ubuntu1404",
  box_version: "<1.0.9", # >=0 is latest. Currently locked at 1.0.9 due to an open issue.
  name: "#{settings["app_name"]}_vm",
  num_cpus: 2,
  ram: 4096
}

# Create virtual machines.
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # Synced folders.
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder "..", "#{settings["app_root"]}/app", :mount_options => ["uid=#{settings["app_user_id"]},gid=#{settings["app_user_id"]}"]

  # General config.
  config.ssh.insert_key = false
  config.vm.box = VM_VARS[:box]
  config.vm.box_version = VM_VARS[:box_version]
  config.vm.hostname = settings["server_name"]
  config.vm.network :private_network, ip: "10.1.2.100"

  # Config for vmware. (default)
  config.vm.provider :vmware_fusion do |vmware|
    vmware.vmx['displayname'] = VM_VARS[:name]
    vmware.vmx["numvcpus"] = VM_VARS[:num_cpus]
    vmware.vmx["memsize"] = VM_VARS[:ram]
  end

  # Config for virtualbox.
  config.vm.provider :virtualbox do |virtualbox|
    virtualbox.name = VM_VARS[:name]
    virtualbox.cpus = VM_VARS[:num_cpus]
    virtualbox.memory = VM_VARS[:ram]
  end

  # Install required Ansible roles.
  config.trigger.before [:up, :provision] do
    run "ansible-galaxy install --role-file=playbooks/requirements.yml --roles-path=playbooks/roles/.external --force"
  end

  # Provision using Ansible.
  config.vm.provision "main", type: "ansible" do |ansible|
    ansible.limit = "all"
    ansible.verbose =  "vvvv"
    ansible.force_remote_user = false
    ansible.extra_vars = settings
    ansible.playbook = "playbooks/main.yml"
    ansible.groups = {
      "app" => ["default"],
      "postgresql" => ["default"],
      "all_groups:children" => ["app", "postgresql"]
    }
    #ansible.skip_tags = ["deploy"]
    #ansible.raw_arguments  = ["--ask-vault-pass"]
    ansible.raw_ssh_args = ["-o ConnectTimeout=120"]
  end
end
