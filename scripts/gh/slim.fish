jq -S '
    flatten
    | map({
        name: .name,
        description: .description,
        html_url: .html_url,
        fork: .fork,
        created_at: .created_at,
        updated_at: .updated_at,
        size: .size,
        stargazers: .stargazers_count,
        watchers: .watchers_count,
        language: .language,
        archived: .archived,
        disabled: .disabled,
        license: (.license.spdx_id // null),
        topics: (.topics // [])
      })
  ' my-public-repos.full.json >my-public-repos.slim.pretty.json
