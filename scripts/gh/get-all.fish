# Full REST repo objects for ONLY your OWN public repos
gh api --paginate --slurp \
    "/user/repos?per_page=100&affiliation=owner&visibility=public&sort=updated" >my-public-repos.full.json
