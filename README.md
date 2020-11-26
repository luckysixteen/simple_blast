# simple_blast

## Packages

The following tools/modules are used to implement
1. python3 with the following requrements (All modules have already installed in virturalenv):
```
django
biopython
```
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
```
docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/results:/blast/results:rw \
    ncbi/blast \
    blastp -query /blast/queries/test.fasta -db ecoli \
    -outfmt "6 sstart send evalue pident sstrand"
``` 
```
docker run --rm -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastp -query /blast/queries/test.fasta -db ecoli -outfmt "6 sstart send evalue pident sstrand"
```