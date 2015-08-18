git clone git@github.com:shangfu/shangfu.github.io.git
cd shangfu.github.io
git checkout source
mkdir _deploy
cd _deploy
git init
git remote add origin git@github.com:shangfu/shangfu.github.io.git
git pull origin master
cd ..