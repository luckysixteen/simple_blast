# simple_blast

## Packages

The following tools/modules are used to implement
1. python3 with the following requrements (All modules have already installed in virturalenv):
```
biopython             1.78
Django                3.1.3
django-after-response 0.2.2 
```
django-after-response is for python asyc call. Check the [doc](https://github.com/defrex/django-after-response)

2. docker

## Step to run
1. Install ncbi/blast docker image
```bash
$ docker pull ncbi/blast
```

2. Enter virtualenv
```bash
$ source venv/bin/source
```  
3. Start the server
```bash
(venv)$ python manage.py runserver
```
## Overlook
 ![Tux, the Linux mascot](/overlook.png)

# Notes
## ncbi/blast Set up
reference https://github.com/ncbi/blast_plus_docs
### download ncbi/blast image
``` bash
$ docker pull ncbi/blast
```
### Make BLAST database 
Command
```
$ docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:rw \
    -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro \
    -w /blast/blastdb_custom \
    ncbi/blast \
    makeblastdb -in /blast/fasta/ecoli_k12_mg1655.fasta -dbtype prot \
    -parse_seqids -out ecoli -title "ecoli" \
    -taxid 7801 -blastdb_version 0
```
Outputs
```bash
Building a new DB, current time: 11/25/2020 23:43:20
New DB name:   /blast/blastdb_custom/ecoli
New DB title:  ecoli
Sequence type: Protein
Keep MBits: T
Maximum file size: 1000000000B
Adding sequences from FASTA; added 1 sequences in 0.162382 seconds.
```
### Verify new database
Command
```bash
$ docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    ncbi/blast \
    blastdbcmd -entry all -db ecoli -outfmt "%a %l %T"
```
Output
```
U00096.3 4641652 7801
```

### Run BLAST 
the command that using in the Django backend.
Old Command: `blastp` for searching in Database (wrong)
```bash
docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/results:/blast/results:rw \
    ncbi/blast \
    blastp -query /blast/queries/test.fasta -db ecoli \
    -outfmt "6 sstart send evalue pident sstrand"
```

Correct Command: using `blastn` to search subject DNA sequence
* Format output
```
docker run --rm 
    -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro 
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro 
    ncbi/blast blastn -query /blast/queries/test.fasta -subject /blast/fasta/ecoli_k12_mg1655.fasta -outfmt "6 sstart send evalue pident sstrand"
```
* Default output doc
```
docker run --rm \
    -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/results:/blast/results:rw \
    ncbi/blast blastn -query /blast/queries/test.fasta -subject /blast/fasta/ecoli_k12_mg1655.fasta -out /blast/results/blastn.txt
``` 
```
docker run --rm -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastn -query /blast/queries/test.fasta -subject /blast/fasta/ecoli_k12_mg1655.fasta -outfmt "6 sstart send evalue pident sstrand"
``` 



* User end calls a POST request with query string to Django server. Server creates BlastJob and BlastResult model, save Result into database and sends back the result_no to user end.
* Django server open a subprocess to run Docker to do Blast Search. Once Docker finish, Django server update BlastResult in the database
* User end sends a request with result_no every two seconds. Django check database, if 



### Front end test case
```json
response_data = {
    0: {
        'sstart':
        '7561',
        'send':
        '7770',
        'sstrand':
        'N/A',
        'evalue':
        '2.02e-79',
        'pident':
        '99.524',
        'sequence':
        'CATATACCATGCCGGTCCGCCACGAAACTGCCCATTGACGTCACGTTCTTTATAAAGTTGTGCCAGAGAACATTCGGCAAACGAGGTCGCCATGCCGATAAACGCGGCAACCCACATCCAAAAGACGGCTCCAGGTCCAC'
    },
    1: {
        'sstart':
        '7561',
        'send':
        '7770',
        'sstrand':
        'N/A',
        'evalue':
        '2.02e-79',
        'pident':
        '99.524',
        'sequence':
        'CATATACCATGCCGGTCCGCCACGAAACTGCCCATTGACGTCACGTTCTTTATAAAGTTGTGCCAGAGAACATTCGGCAAACGAGGTCGCCATGCCGATAAACGCGGCAACCCACATCCAAAAGACGGCTCCAGGTCCAC'
    },
    'length': 1
}
```

### Migrate and building DB
```
(venv) Jens-MacBook:simple_blast Jen$ python manage.py makemigrations blast
Migrations for 'blast':
  blast/migrations/0001_initial.py
    - Create model BlastJob
    - Create model BlastResult
(venv) Jens-MacBook:simple_blast Jen$ python manage.py sqlmigrate blast 0001
BEGIN;
--
-- Create model BlastJob
--
CREATE TABLE "blast_blastjob" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "query" varchar(255) NULL, "status" varchar(10) NULL);
--
-- Create model BlastResult
--
CREATE TABLE "blast_blastresult" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "result_no" integer NOT NULL, "sstart" integer NOT NULL, "send" integer NOT NULL, "sstrand" varchar(5) NOT NULL, "evalue" real NOT NULL, "pident" real NOT NULL, "sequence" varchar(255) NOT NULL, "blast_job_id" integer NOT NULL REFERENCES "blast_blastjob" ("id") DEFERRABLE INITIALLY DEFERRED);
CREATE INDEX "blast_blastresult_blast_job_id_9ebf7bce" ON "blast_blastresult" ("blast_job_id");
COMMIT;
(venv) Jens-MacBook:simple_blast Jen$ python manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, blast, contenttypes, sessions
Running migrations:
  Applying blast.0001_initial... OK
```


### Problem Shooting
* Problem: Cannot migrate
* Solution: Comment `import utils.py` in `views.py` the cause is from numpy and is not stable for python3.9 on Big Sur..... 
```
(venv) Jens-MacBook:simple_blast Jen$ python manage.py migrate
Python(19636,0x10f44de00) malloc: can't allocate region
:*** mach_vm_map(size=18446744072121352192, flags: 100) failed (error code=3)
Python(19636,0x10f44de00) malloc: *** set a breakpoint in malloc_error_break to debug
init_dgelsd failed init
Traceback (most recent call last):
  File "/Users/Jen/GitHub/simple_blast/manage.py", line 21, in <module>
    main()
  File "/Users/Jen/GitHub/simple_blast/manage.py", line 17, in main
    execute_from_command_line(sys.argv)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/__init__.py", line 401, in execute_from_command_line
    utility.execute()
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/__init__.py", line 395, in execute
    self.fetch_command(subcommand).run_from_argv(self.argv)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/base.py", line 330, in run_from_argv
    self.execute(*args, **cmd_options)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/base.py", line 371, in execute
    output = self.handle(*args, **options)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/base.py", line 85, in wrapped
    res = handle_func(*args, **kwargs)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/commands/migrate.py", line 75, in handle
    self.check(databases=[database])
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/management/base.py", line 392, in check
    all_issues = checks.run_checks(
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/checks/registry.py", line 70, in run_checks
    new_errors = check(app_configs=app_configs, databases=databases)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/checks/urls.py", line 13, in check_url_config
    return check_resolver(resolver)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/core/checks/urls.py", line 23, in check_resolver
    return check_method()
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/urls/resolvers.py", line 408, in check
    for pattern in self.url_patterns:
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/utils/functional.py", line 48, in __get__
    res = instance.__dict__[self.name] = self.func(instance)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/urls/resolvers.py", line 589, in url_patterns
    patterns = getattr(self.urlconf_module, "urlpatterns", self.urlconf_module)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/utils/functional.py", line 48, in __get__
    res = instance.__dict__[self.name] = self.func(instance)
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/urls/resolvers.py", line 582, in urlconf_module
    return import_module(self.urlconf_name)
  File "/usr/local/Cellar/python@3.9/3.9.0_2/Frameworks/Python.framework/Versions/3.9/lib/python3.9/importlib/__init__.py", line 127, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "<frozen importlib._bootstrap>", line 1030, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1007, in _find_and_load
  File "<frozen importlib._bootstrap>", line 986, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 680, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 790, in exec_module
  File "<frozen importlib._bootstrap>", line 228, in _call_with_frames_removed
  File "/Users/Jen/GitHub/simple_blast/blast_test/urls.py", line 21, in <module>
    path('', include('blast.urls')),
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/django/urls/conf.py", line 34, in include
    urlconf_module = import_module(urlconf_module)
  File "/usr/local/Cellar/python@3.9/3.9.0_2/Frameworks/Python.framework/Versions/3.9/lib/python3.9/importlib/__init__.py", line 127, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "<frozen importlib._bootstrap>", line 1030, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1007, in _find_and_load
  File "<frozen importlib._bootstrap>", line 986, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 680, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 790, in exec_module
  File "<frozen importlib._bootstrap>", line 228, in _call_with_frames_removed
  File "/Users/Jen/GitHub/simple_blast/blast/urls.py", line 3, in <module>
    from . import views
  File "/Users/Jen/GitHub/simple_blast/blast/views.py", line 7, in <module>
    from .utils import *
  File "/Users/Jen/GitHub/simple_blast/blast/utils.py", line 5, in <module>
    from Bio import SeqIO
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/Bio/SeqIO/__init__.py", line 382, in <module>
    from Bio.Align import MultipleSeqAlignment
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/Bio/Align/__init__.py", line 21, in <module>
    from Bio.Align import substitution_matrices
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/Bio/Align/substitution_matrices/__init__.py", line 12, in <module>
    import numpy
  File "/Users/Jen/GitHub/simple_blast/venv/lib/python3.9/site-packages/numpy/__init__.py", line 286, in <module>
    raise RuntimeError(msg)
RuntimeError: Polyfit sanity test emitted a warning, most likely due to using a buggy Accelerate backend. If you compiled yourself, see site.cfg.example for information. Otherwise report this to the vendor that provided NumPy.
RankWarning: Polyfit may be poorly conditioned
```
```
(venv) Jens-MacBook:simple_blast Jen$ python manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying sessions.0001_initial... OK
```