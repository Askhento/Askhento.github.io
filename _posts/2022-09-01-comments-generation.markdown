---
layout: post
title: Automate post creation with github comments
comments_id: 4
published: true
categories: ["hacks", "webdev"]
tags: ["python", "jekyll", "gh-pages", "comments"]
---

### Motivation

Let's be honest, I use github issues to host comments on this site. It is great, but I found it difficult to create issues manually so here is an attemp to document my journey on automatic post creation script.

For thos of who also would like to add comments please read the article [Jekyll comment system github issues][comments-aleks] by Aleksandr Hovhannisyan.

### Googling

I am looking for something that will use VS Code
After some time of surfing the internet I decided to use tasks in VSCode to run [github cli tool][gh-cli] here is how to install it with brew (MacOS but other platform available too):

### Github API

```bash
brew install gh
```

This cli tool require authentication, so you need to run and follow steps. I choose to use my credetials, but probably it is better to create PAT(personal access token).

```bash
gh auth login
```

Anyways lets check how it works changing directory to git repository and then run:

```bash
cd YourSiteFolder
gh issue list
```

You should see a file with issue names, tags, labels, date updated. So far so good, let's move on!

### Create VSCode task

Press <kbd>CMD+SHIFT+P</kbd> inside VSCode and then type "task" and choose "Run Task". You don't have any tasks so choose "Create new Task".

VSCode will create tasks.json file inside .vscode folder and with some boilerplate code. Here is how my tasks.json look like right now:

```json
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Create Post",
      "type": "shell",
      "command": "python3 create_post.py \"${input:title}\" ${input:comments} ${input:categories} ${input:tags}",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "title",
      "description": "Set title",
      "default": "cool-title",
      "type": "promptString"
    },
    {
      "id": "comments",
      "description": "Add comments?",
      "default": "yes",
      "options": ["yes", "no"],
      "type": "pickString"
    },
    {
      "id": "categories",
      "description": "Set some categories",
      "default": "post",
      "type": "promptString"
    },
    {
      "id": "tags",
      "description": "Set some tags",
      "default": "awesome-tag",
      "type": "promptString"
    }
  ]
}
```

Tasks - commands you would like to run.
Inputs - this is arguments which will be used when you run the task, they could be strings(promptString) or list of strings (pickString). When you will run your task some usefull prompts will appear to help filling default values.

### Python script

First of all I will imort modules:

```python
import argparse # for using cli arguments
from datetime import datetime # posts need to be formated with date
import subprocess # run gh-cli from python :D
import re # regular expressions
```

Let's parse our arguments:

```python
def main():
    parser = argparse.ArgumentParser(description='Create a new post')
    parser.add_argument("title", type=str, help="Provide a title")
    parser.add_argument("comments", type=str, help="Provide a title")
    parser.add_argument("categories", type=str, help="Provide a comma separated list of categories")
    parser.add_argument("tags", type=str, help="Provide a comma separated list of tags")
    args = parser.parse_args()

if __name__ == "__main__":
    main()

```

Here argparse module will take care of all for us. You have to careful not to use type=bool, because it will always be True.

Next we need to get time:

```python
def main():

    #previous code

    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    args.current_time = current_time
    date = str(datetime.date(now))
    args.date = date
```

The most difficult part is github api. We need to create issue and then parse issue_id from url.

```python
def main():

    #previous code

    create_issue_cmd = f"echo $(gh issue create --title \"Comments for {format_filename(args.date, args.title)}\" --body \"{args.title} discussion here:\" --label \"comments\")"
    print(create_issue_cmd)

    process = subprocess.Popen(create_issue_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    # Store the return code in rc variable
    rc = process.wait()
    issue_url,err = process.communicate()

    if (rc != 0): # non zero code == error
        print(err)
        return

    print(issue_url)
```

Subprocess is the module to run shell commands from python. Parameters to note :

- shell - will run as a real shell with all environment variables.
- universal_newlines - will convert results from binary representation

I wrapped command to create issue inside echo, so that shell will not open file with vim in my case.
Finally lets use regular expressions to parse issue_id:

```python
def main():

    #previous code

    # Example url, here we need to get "2"
    # issue_url="https://github.com/Askhento/Askhento.github.io/issues/2"

    pattern = re.compile(r'\d+$')
    try:
        match = re.search(pattern, issue_url).group()
        args.comments_id = match
    except AttributeError:
        pass
        # print('No match')

    write_frontmatter(args) # write to file function

```

Regular expression '\d+$' means :

- \d - match digit
- \+ - one or more
- $ - match at the end
  To test you expression you can use online tools like [regexr][regexr].

Here is write_frontmatter and helper function function without much of explanation:

```python
def format_filename(date, title):
    return f'{date}-{title.replace(" ", "-").lower()}.markdown'

def write_frontmatter(args):
    f = open(f"./_posts/{format_filename(args.date, args.title)}", "w")
    f.write("---\n")
    f.write("layout: post\n")
    f.write(f"title: {args.title}\n")
    if ("comments_id" in args) :
        f.write(f"comments_id: {args.comments_id }\n")

    f.write("published: true\n")
    f.write(f"categories: {args.categories.split(',')}\n")
    f.write(f"tags: {args.tags.split(',')}\n")
    f.write("---\n")
    f.close()

```

### Run it!

So here it is! You can now run the task to create new posts. Keep in mind that it will create a new issue for every new post and will override post with the same date+title.

[comments-aleks]: https://www.aleksandrhovhannisyan.com/blog/jekyll-comment-system-github-issues/
[gh-cli]: https://github.com/cli/cli
[regexr]: https://regexr.com
