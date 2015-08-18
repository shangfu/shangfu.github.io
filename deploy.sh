rake generate      # 生成页面
#rake preview       # 如果需要在本地预览生成的结果，预览页http://localhost:4000
rake deploy        #发布到github
# 发布到github的pages在master分支，还要保存源的source分支
git add .
git commit -m 'Added About page and first post!'
git push origin source