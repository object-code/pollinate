# Pollinate

> **NOTE:** This project is in active development. If you like the idea
> and want to help, awesome!

Think of a tree of files as a `Flower` and a source data as `Pollen`; combined
together they create a fertilized project. Pollinate will allow you to template
a set of files and store them on GitHub.  When you decide to use them later you
can **pollinate** them using an object of data.

#### What exactly is this project attempting to accompish?

Pollinate aims to be a simple to understand process for templating file trees to
meet a specific and repeatable purpose. The idea is to design your templates to
have subtle points of variation that can be defined within an object of data.
You would define which files to `discard`, which files to `parse` for template
tags, and which files to `move` to new names or paths.

Pollinate will allow you to store your templates on GitHub and chip away at them
over time. This process will enable you to benefit from open-source communities
which share similar goals. When you need to use a template Pollinate aims to 
ensure that the process is as quick and efficient as possible.

#### The `Flower`

The `Flower` is a GitHub repository which holds all of the files.  Any file can
can be passed through a template engine using the supplied data. Some files like
the original README may need to go, and maybe a new templated README will need to 
take its place. The `Flower` also supplies its own default data object.

#### The `Pollen`

The `Pollen` is pretty much just a vessel to get new data to the `Flower`. Much
like how pollen works in nature. It can be supplied as an HTTP JSON endpoint, as
a local file, or directly as a set of arguments.

#### The Data

Consider the data to be more like the DNA of the operation. Both sides can
supply it, but the data from the `Pollen` takes precedence when merging the
objects. The data supplies a list of files to act upon with the template engine
along with the data to inject. The data can also supply file operations to move
or delete files during the process.

## An Example

Suppose someone built a `Flower` designed to start a building a project using
[MEANstack](http://mean.io). They set it up so that development can occur within
a [Vagrant](https://www.vagrantup.com/) box and configure the files so that all
the dependencies like [MongoDB](http://www.mongodb.org/) are automatically
installed using [Salt](http://www.saltstack.com/). In that `Flower` there are a
few files where details need to be filled in and a couple files that need to
move around. It is likely that the original README.md file would provide context
that is no longer needed after parsing, so that would need to go.

Some other wonderful person builds a simple service that enables the ability to
submit that `Flower`. The service offers a lovely UI to choose the `Flower` and
convert custom options into a JSON object that is offered up via a unique hash.
You come along and pick the very same `Flower` to use. You are offered up a
string to copy and paste it into a terminal with Node.js running, and voila!

```
$ pollinate codingcoop/test-flower test.json
```

##### The `Flower` repository

```
.
├── PROJECT-README
├── README.md
├── Vagrantfile
└── flower.json
```

##### The object within the `Flower`

```
{
  "name": "newproject",
  "context": {
    "box_name": "precise64",
    "box_url": "http://files.vagrantup.com/precise64.box"
  },
  "operations": {
    "discard": [
      "README.md",
      "LICENSE"
    ],
    "parse": [
      "PROJECT-README",
      "Vagrantfile"
    ],
    "move": [
     { "PROJECT-README": "README.md" }
    ]
  }
}
```

##### The object supplied by the `Pollen`

```
{
  "name": "codingcoop",
  "context": {
    "box_name": "trusty64",
    "box_url": "http://files.vagrantup.com/trusty64.box"
  }
}
```

##### The resulting object after merging

```
{
  "name": "codingcoop",
  "context": {
    "box_name": "trusty64",
    "box_url": "http://files.vagrantup.com/trusty64.box"
  },
  "operations": {
    "discard": [
      "README.md",
      "LICENSE"
    ],
    "parse": [
      "Vagrantfile",
      "PROJECT-README"
    ],
    move: [
     { "PROJECT-README": "README.md" }
    ]
  }
}
```

##### The resulting file tree output

```
.
└── codingcoop
   ├── README.md
   └── Vagrantfile
```

(Don't forget to jump into the directory)

```
$ cd codingcoop
```

#### With one `vagrant up` it's ready!
